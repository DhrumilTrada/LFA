import { Transform } from 'class-transformer'
import { IsBoolean, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class MailConfig {
  @IsString()
  @Env('MAIL_FROM_EMAIL')
  @Transform(({ value }) => value.toLowerCase())
  fromEmail: string

  @IsString()
  @Env('MAIL_SMTP_USERNAME')
  mailUserName: string

  @IsString()
  @Env('MAIL_SMTP_PASSWORD')
  mailPassword: string

  @IsString()
  @Env('MAIL_SMTP_HOST')
  mailHost: string

  @IsNumber()
  @Env('MAIL_SMTP_PORT')
  mailPort: number

  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true' || value === true || value === 1 || value === '1'
  })
  @Env('MAIL_SMTP_IGNORETLS')
  mailIgnoreTLS: boolean

  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true' || value === true || value === 1 || value === '1'
  })
  @Env('MAIL_SMTP_SECURE')
  mailSecure: boolean
}
