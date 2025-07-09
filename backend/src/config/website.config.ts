import { IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class WebsiteConfig {
  @IsString()
  @Env('WEBSITE_URL')
  websiteUrl: string
}
