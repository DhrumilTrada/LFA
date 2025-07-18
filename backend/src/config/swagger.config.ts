import { IsBoolean, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class SwaggerConfig {
  @IsBoolean()
  @Env('SWAGGER_GENERATE_DOCUMENTATION')
  generateDocumentation: boolean

  @IsString()
  @Env('SWAGGER_APP_TITLE')
  appTitle: string

  @IsString()
  @Env('SWAGGER_APP_DESCRIPTION')
  appDescription: string

  @IsNumber()
  @Env('SWAGGER_APP_VERSION')
  appVersion: number

  @IsString()
  @Env('SWAGGER_API_PATH')
  apiPath: string
}
