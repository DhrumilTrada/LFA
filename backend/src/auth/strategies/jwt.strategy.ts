import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { UsersApiService } from '../../user/user-api.service'
import { JwtService } from '@nestjs/jwt'
import { AuthJwtConfig } from 'src/config/auth-jwt.config'
import * as Redis from 'ioredis'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private usersApiService: UsersApiService,
    private config: AuthJwtConfig,
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis.Redis
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret,
      passReqToCallback: true // Required to access request in validate()
    })
  }

  async validate(req: Request, payload: any) {
    const token = req.headers.authorization?.split('Bearer ')[1]
    if (!token) {
      throw new UnauthorizedException('Missing token')
    }

    return {
      id: payload.sub,
      role: payload.role
    }
  }
}
