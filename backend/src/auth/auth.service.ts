import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { WebsiteConfig } from '../config/website.config'
import { UpdateUserDto } from '../user/dto/update-user.dto'
import { UsersApiService } from '../user/user-api.service'
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto'
import { ResetPasswordTokenDto } from './dto/reset-password.dto'
import { ValidateTokenDto } from './dto/validate-token.dto'
import { Cron } from '@nestjs/schedule'
import DeviceDetector from 'device-detector-js';
import { getTimeZone } from '../helpers/helpers'
import { Token, User } from '../user/schemas/user.schema'
import { UsersAuthService } from '../user/user-auth.service'
import { ROLE_PERMISSIONS } from './roles/roles'
import { AuthJwtConfig } from '../config/auth-jwt.config'
import { WrapperType } from '../helpers/wrapper-type.decorator'
import { BullConfigService } from '../bull/bull-config.service'
import { AuthResponseMessages } from 'src/config/constants/CustomResponses'
const deviceDetector = new DeviceDetector()
const randomstring = require('randomstring')
import * as Redis from 'ioredis'

@Injectable()
export class AuthService {
  constructor(
    public bullConfigService: BullConfigService,
    @Inject(forwardRef(() => UsersAuthService))
    public usersAuthService: WrapperType<UsersAuthService>,
    private jwtService: JwtService,
    private readonly websiteConfig: WebsiteConfig,
    private authJwtConfig: AuthJwtConfig,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis.Redis
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersAuthService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException([AuthResponseMessages.USER_NOT_FOUND])
    }
    //add token

    if (user && (await bcrypt.compare(pass, user.password))) {
       
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(user: User, ipAddress: string, userAgent: string) {
    let tokens = user.tokens
    !tokens ? (tokens = []) : true

    const refreshToken = randomstring.generate(128)

    //create token object
    const tokenDetails = new Token()
    tokenDetails.refreshToken = refreshToken
    tokenDetails.createdAt = new Date()
    tokenDetails.lastTokenIssuedAt = new Date()
    tokenDetails.userSessionDetails = {
      ip: ipAddress,
      ...deviceDetector.parse(userAgent)
    }

    if (
      this.authJwtConfig.maxSessions &&
      tokens.length >= this.authJwtConfig.maxSessions
    ) {
      tokens.sort(function (a, b) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

      const filteredTokenArray = tokens.splice(0, 1)

      tokens.push(tokenDetails)
    } else {
      tokens.push(tokenDetails)
    }

    const updatedTokens = await this.usersAuthService.updateJWTToken(
      user['_id'],
      tokens
    )


    const tokenObject = updatedTokens.find(
      (it) => it.refreshToken === refreshToken
    )
    const payload = {
      role: user.role,
      sub: user['_id'],
      refreshTokenId: tokenObject['_id']
    }
    const newToken = this.jwtService.sign(payload)

    const updatedUser = await this.usersAuthService.getUserProfile(user['_id'])

    return {
      accessToken: newToken,
      refreshToken: refreshToken,
      user: updatedUser
    }
  }
  async logout(req: Request, userId: string) {

    if (!req.headers['authorization']) {
      throw new UnauthorizedException([AuthResponseMessages.INVALID_TOKEN_KEY])
    }
    const idToken = req.headers['authorization'].split('Bearer ')[1]
    const decodeToken = this.jwtService.decode(idToken)

    const ttl = decodeToken.exp - Math.floor(Date.now() / 1000)

    const update = await this.usersAuthService.removeToken(
      decodeToken['refreshTokenId'],
      userId
    )

    if (!update) {
      throw new HttpException(
        AuthResponseMessages.LOGOUT_ERROR,
        HttpStatus.BAD_REQUEST
      )
    }
    return update
  }
  async getNewAccessJwtToken(req: Request, userId: string) {
    const user = await this.usersAuthService.getUserProfile(userId)
    const accessToken = req.headers['authorization'].split('Bearer ')[1]
    const decodeAccessToken = this.jwtService.decode(accessToken)

    const getExpiretimeInMillis = Date.now() - decodeAccessToken['exp'] * 1000

    if (getExpiretimeInMillis > this.authJwtConfig.accessTokenRenewExpireTime) {
      throw new HttpException(
        AuthResponseMessages.TOKEN_EXPIRED,
        HttpStatus.BAD_REQUEST
      )
    }

    const payload = {
      role: user.role,
      sub: userId,
      refreshTokenId: decodeAccessToken['refreshTokenId']
    }
    const newToken = this.jwtService.sign(payload)
    const decodeToken = this.jwtService.decode(newToken)

    const refreshToken = req.body?.['refreshToken']
    const token = await this.usersAuthService.getUserTokenDetailsByTokenId(
      userId,
      decodeAccessToken['refreshTokenId']
    )

    if (token) {
      token['lastTokenIssuedAt'] = new Date(decodeToken['iat'] * 1000)

      await this.usersAuthService.replaceWithRefreshToken(refreshToken, token)

      return { accessToken: newToken }
    } else {
      throw new HttpException(
        AuthResponseMessages.INVALID_TOKEN,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async removeExpireToken() {
    console.log('cron run successfully')
    const update = await this.usersAuthService.removeExpireTokenFromAllUsers()
    return update
  }

  public createResetPasswordToken(userData: any) {
    const payload = {
      email: userData.email.toLowerCase(),
      name: userData.name
    }

    return this.jwtService.sign(payload)
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
    userId: string
  ) {
    const newUpdateUserDto = new UpdateUserDto()

    newUpdateUserDto.name = updateUserDto.name

    if (updateUserDto.password) {
      newUpdateUserDto.password = updateUserDto.password
    }

    return await this.usersAuthService.update(id, newUpdateUserDto, userId)
  }

  async resetPasswordRequest(resetPasswordRequestDto: ResetPasswordRequestDto) {
    const userData = await this.usersAuthService.findByEmail(
      resetPasswordRequestDto.email
    )

    if (!userData) {
      throw new HttpException(
        AuthResponseMessages.EMAIL_NOT_REGISTERED,
        HttpStatus.BAD_REQUEST
      )
    }

    const jwtResetPasswordToken = this.createResetPasswordToken(userData)

    const updateUser = await this.usersAuthService.updateResetPasswordToken(
      userData['_id'],
      jwtResetPasswordToken
    )

    if (!updateUser) {
      throw new HttpException(
        AuthResponseMessages.INVALID_UPDATES,
        HttpStatus.BAD_REQUEST
      )
    }

    const link =
      this.websiteConfig.websiteUrl +
      'reset-password?token=' +
      updateUser['resetPasswordToken']

    this.bullConfigService.resetPasswordRequestMailQueue(userData, link)

    return { mailSent: true }
  }

  async resetPassword(resetPasswordToken: ResetPasswordTokenDto) {
    const userData = await this.usersAuthService.findUserByResetPasswordToken(
      resetPasswordToken.resetPasswordToken
    )
    if (!userData) {
      throw new HttpException(
        AuthResponseMessages.PASSWORD_RESET_TOKEN_EXPIRED,
        HttpStatus.BAD_REQUEST
      )
    }
    // name and password

    const saltOrRounds = 10
    const updatePassword = await bcrypt.hash(
      resetPasswordToken.password,
      saltOrRounds
    )

    const updateData = await this.usersAuthService.resetUserPassword(
      userData.id,
      updatePassword
    )

    if (!updateData) {
      throw new HttpException(
        AuthResponseMessages.ERROR_UPDATING_PASSWORD,
        HttpStatus.BAD_REQUEST
      )
    }
    this.bullConfigService.resetPasswordMailQueue(updateData)

    return { mailSent: true }
  }

  //get User Details by user id from the access token
  async getUserProfile(userId: string): Promise<User> {
    const user = await this.usersAuthService.getUserProfile(userId)
    user['permissions'] = ROLE_PERMISSIONS[user.role]
    return user
  }

  async validateToken(validateTokenDto: ValidateTokenDto) {
    const user = await this.usersAuthService.findUserByResetPasswordToken(
      validateTokenDto.resetPasswordToken
    )
    const data = {
      isNewUser: false,
      name: '',
      email: '',
      isValid: false
    }

    if (!user) {
      data.isValid = false
    } else {
      data.isValid = true
    }

    if (user) {
      data.name = user.name
      data.email = user.email
    }

    if (user && !user.password) {
      data.isNewUser = true
    } else {
      data.isNewUser = false
    }
    return data
  }
}
