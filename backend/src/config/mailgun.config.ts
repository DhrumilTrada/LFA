import { IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'
import { Transform } from 'class-transformer'

export class MailgunConfig {
  @IsString()
  @Env('MAILGUN_API_KEY')
  apiKey: string

  @IsString()
  @Env('MAILGUN_DOMAIN')
  domain: string

  @IsString()
  @Env('MAILGUN_FROM_EMAIL')
  @Transform(({ value }) => value.toLowerCase())
  fromEmail: string
}
