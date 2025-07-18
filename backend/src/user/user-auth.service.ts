import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import { AuthService } from '../auth/auth.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { Token, User, UserDocument } from './schemas/user.schema'
import * as bcrypt from 'bcrypt'
import { WrapperType } from '../helpers/wrapper-type.decorator'
import { AuthJwtConfig } from 'src/config/auth-jwt.config'

@Injectable()
export class UsersAuthService {
  private readonly logger = new Logger(UsersAuthService.name)
  constructor(
    @InjectModel(User.name) public userModel: PaginateModel<UserDocument>,
    @Inject(forwardRef(() => AuthService))
    private authService: WrapperType<AuthService>,
    private authJwtConfig: AuthJwtConfig
  ) {}

  async updateResetPasswordToken(
    id: string,
    findByIdAndUpdateResetPasswordToken: string
  ) {
    return await this.userModel
      .findByIdAndUpdate(
        id,
        { resetPasswordToken: findByIdAndUpdateResetPasswordToken },
        {
          new: true,
          lean: true
        }
      )
      .select('+resetPasswordToken')
      .exec()
  }

  async resetUserPassword(id: string, password: string) {
    return await this.userModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            resetPasswordToken: null,
            password: password
          }
        },
        {
          new: true,
          lean: true
        }
      )
      .lean()
      .exec()
  }

  async findUserByResetPasswordToken(resetToken: string) {
    return await this.userModel
      .findOne({
        resetPasswordToken: resetToken
      })
      .exec()
  }

  //update the jwt token
  async updateJWTToken(id: string, tokensArray: Token[]): Promise<Token[]> {
    return (
      await this.userModel
        .findByIdAndUpdate(
          id,
          { tokens: tokensArray },
          {
            new: true,
            lean: true
          }
        )
        .select('tokens')
        .lean()
        .exec()
    ).tokens
  }

  //remove that token object from tokens array
  async removeToken(tokenId: string, userId: string) {
    return await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { tokens: { _id: tokenId } } },
        { new: true, lean: true }
      )
      .select('-tokens -password')
      .lean()
      .exec()
  }

  async removeExpireTokenFromAllUsers() {
    console.log('Entry:remove expire token function in user service ')

    //remove all the refresh tokens which have not issued any access tokens in the inactivity time
    const data = await this.userModel.updateMany(
      {},
      {
        $pull: {
          tokens: {
            lastTokenIssuedAt: {
              $lt: new Date(
                Date.now() - this.authJwtConfig.accessTokenRenewExpireTime
              )
            }
          }
        }
      },
      { new: true, lean: true }
    )

    return data
  }

  //get that token object which is match by refresh token id
  async getUserTokenDetailsByTokenId(
    userId: string,
    refreshTokenId: string
  ): Promise<Token> {

    return (
      await this.userModel
        .findOne({
          _id: userId,
          'tokens._id': refreshTokenId
        })
        .select({ tokens: { $elemMatch: { _id: refreshTokenId } } })
        .lean()
        .exec()
    )?.tokens?.[0]
  }

  async getUserToken(userId: string): Promise<Token[]> {
    return (
      await this.userModel
        .findOne({
          _id: userId
        })
        .select('tokens')
        .lean()
        .exec()
    ).tokens
  }

  async replaceWithRefreshToken(
    refreshToken: string,
    replaceTokenObject: Token
  ) {
    console.log(
      'Entry:replace with refresh token function in users service params : refreshToken ' +
        JSON.stringify(refreshToken) +
        ' replaceTokenObject ' +
        JSON.stringify(replaceTokenObject)
    )
    //change the last token issued at time
    const data = await this.userModel.findOneAndUpdate(
      { 'tokens.refreshToken': refreshToken },
      {
        $set: {
          'tokens.$.lastTokenIssuedAt': replaceTokenObject.lastTokenIssuedAt
        }
      },
      { new: true, lean: true }
    )

    return data
  }

  /**
   * Get a user detail from the email address
   * @param email Email of the user
   * @param isActive need to find from the active users or also look into the deactaviated users
   * @returns
   */
  async findByEmail(email: string, isActive = true): Promise<User> {
    console.log(
      'Entry:find by email function in user service params : email ' +
        JSON.stringify(email)
    )
    const result = await this.userModel
      .findOne({ email: email.toLowerCase(), isActive: isActive })
      .select('+password +tokens')
      .lean()
      .exec()

    return result
  }

  async getUserProfile(userId: string): Promise<User> {
    return await this.userModel.findOne({ _id: userId }).lean().exec()
  }

  /**
   * Updates the user object
   * @param id
   * @param updateUserDto
   * @returns User
   */
  async update(id: string, updateUserDto: UpdateUserDto, userData) {
    console.log(
      'Entry:update user function in user service params : id ' +
        JSON.stringify(id) +
        ' updateUserDto ' +
        JSON.stringify(updateUserDto) +
        ' userData ' +
        JSON.stringify(userData)
    )
    // check if password is there
    if (updateUserDto.password) {
      // Update the password with bcrypt
      const saltOrRounds = 10
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltOrRounds
      )
    }

    const oldUser = await this.userModel.findOne({ _id: id }).lean().exec()

    // { new: true, lean: true }
    const updatedData = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec()

    return updatedData
  }
}
