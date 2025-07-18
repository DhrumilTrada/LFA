import { forwardRef, Module } from '@nestjs/common'
import { UsersApiService } from './user-api.service'
import { UsersController } from './user.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './schemas/user.schema'
import { MailsModule } from '../mails/mails.module'
import { AuthModule } from '../auth/auth.module'
import { UsersAuthService } from './user-auth.service'
import { CustomCacheModule } from '../cache/cache.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailsModule,
    forwardRef(() => AuthModule),
    CustomCacheModule
  ],
  controllers: [UsersController],
  providers: [UsersApiService, UsersAuthService],
  exports: [UsersApiService, UsersAuthService]
})
export class UsersModule {}
