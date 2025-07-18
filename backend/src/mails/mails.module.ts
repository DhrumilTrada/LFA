import { Module } from '@nestjs/common'
import { MailsService } from './mails.service'
import { MailsController } from './mails.controller'
import { BullModule } from '@nestjs/bull'
import { BullConfigModule } from '../bull/bull-config.module'

@Module({
  imports: [
    BullConfigModule
  ],
  controllers: [MailsController],
  providers: [MailsService],
  exports: [MailsService]
})
export class MailsModule {}
