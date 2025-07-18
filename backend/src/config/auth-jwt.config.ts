import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class AuthJwtConfig {
  @IsString()
  @IsNotEmpty()
  @Env('AUTH_JWT_SECRET')
  secret: string

  @IsString()
  @Env('AUTH_JWT_EXPIRATION_TIME')
  expirationTime: string

  @IsNumber()
  @Env('AUTH_BCRYPT_ROUNDS')
  rounds: number

  @IsNumber()
  @Env('AUTH_MAX_SESSIONS')
  maxSessions: number

  @IsNumber()
  @Env('AUTH_ACCESS_TOKEN_RENEW_EXPIRE_TIME')
  accessTokenRenewExpireTime: number
}
