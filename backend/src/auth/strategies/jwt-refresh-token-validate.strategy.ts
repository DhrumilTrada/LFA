import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersAuthService } from '../../user/user-auth.service'
import { AuthJwtConfig } from 'src/config/auth-jwt.config'
import { AuthResponseMessages } from 'src/config/constants/CustomResponses'

/**
 * refresh JWT Strategy to validates the access token and check expire time of access token
 * and check refresh token is same as issued access token and sets the user object
 * check the access token with expire time
 * check access token is generated from that users refresh token and refresh token Id is associated with that user
 */
@Injectable()
export class ValidateRefreshTokenJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-validate-token'
) {
  constructor(
    private usersAuthService: UsersAuthService,
    private config: AuthJwtConfig,
    private jwtService: JwtService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // does not allow expire access token while checking refresh token is attached with that access token.
      secretOrKey: config.secret,
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: any) {
    // console.log(
    //   'Entry:validate Jwt-refresh token strategy Validate function params : req ' +
    //     JSON.stringify(req.body) +
    //     ' payload ' +
    //     JSON.stringify(payload)
    // )

    const token = await this.usersAuthService.getUserTokenDetailsByTokenId(
      payload.sub,
      payload.refreshTokenId
    )

    if (token && token?.['_id'].toString() === payload.refreshTokenId) {
      return {
        id: payload.sub,
        role: payload.role
      }
    } else {
      throw new UnauthorizedException(AuthResponseMessages.INVALID_TOKEN)
    }
  }
}
