import { ExtractJwt } from 'passport-jwt'
import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersAuthService } from '../../user/user-auth.service'
import { AuthJwtConfig } from 'src/config/auth-jwt.config'
import { AuthResponseMessages } from 'src/config/constants/CustomResponses'

/**
 * this strategy only used for generate access token api
 * refresh JWT Strategy to validates the access token but does not check the expire time of access token
 * and check refresh token is same as issued access token and sets the user object
 * check the access token without expire time
 * check access token is generated from that users refresh token and refresh token Id is associated with that user
 * check the req.body.refresh token is associated with that user's tokens array
 */
@Injectable()
export class RefreshTokenJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token'
) {
  constructor(
    private usersAuthService: UsersAuthService,
    private config: AuthJwtConfig,
    private jwtService: JwtService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // allow expire access token while checking refresh token is attached with that  access token.
      secretOrKey: config.secret,
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: any) {
    // console.log(
    //   'Entry:Jwt-refresh token strategy validate function params : req ' +
    //     JSON.stringify(req.body) +
    //     ' payload ' +
    //     JSON.stringify(payload)
    // )

    const token = await this.usersAuthService.getUserTokenDetailsByTokenId(
      payload.sub,
      payload.refreshTokenId
    )

    // console.log(token)

    if (
      token &&
      token?.['_id'].toString() === payload.refreshTokenId &&
      token.refreshToken === req.body?.['refreshToken']
    ) {
      return {
        id: payload.sub,
        role: payload.role
      }
    } else {
      throw new UnauthorizedException(AuthResponseMessages.INVALID_TOKEN)
    }
  }
}
