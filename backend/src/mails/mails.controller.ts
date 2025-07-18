import { Controller, Post, Query } from '@nestjs/common'
import { MailsService } from './mails.service'
import { ApiQuery } from '@nestjs/swagger'

@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Post('send')
  @ApiQuery({ name: 'email', required: true, type: 'string' })
  @ApiQuery({ name: 'name', required: true, type: 'string' })
  async sendEmail(@Query('email') email: string, @Query('name') name: string) {
    return await this.mailsService.sendMail(email, name)
  }
}
