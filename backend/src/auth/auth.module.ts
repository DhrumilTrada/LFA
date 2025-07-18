import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../user/user.module'
import { PassportModule } from '@nestjs/passport'
import { AuthJwtConfig } from '../config/auth-jwt.config'
import { JwtModule } from '@nestjs/jwt'
import { ScheduleModule } from '@nestjs/schedule'
import { MailsModule } from '../mails/mails.module'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RefreshTokenJwtStrategy } from './strategies/jwt-refresh-token.strategy'
import { ValidateRefreshTokenJwtStrategy } from './strategies/jwt-refresh-token-validate.strategy'
import { BullConfigModule } from '../bull/bull-config.module'
import { RedisModule } from 'src/redis/redis.module'

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    MailsModule,
    JwtModule.registerAsync({
      inject: [AuthJwtConfig],
      useFactory: (jwtConfig: AuthJwtConfig) => ({
        secret: jwtConfig.secret,
        signOptions: { expiresIn: jwtConfig.expirationTime }
      })
    }),
    ScheduleModule.forRoot(),
    BullConfigModule,
    RedisModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenJwtStrategy,
    ValidateRefreshTokenJwtStrategy
  ],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
