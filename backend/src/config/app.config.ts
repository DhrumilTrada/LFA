import { IsBoolean, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class AppConfig {
  @IsNumber()
  @IsNotEmpty()
  @Env('APP_PORT')
  port: number

  @IsNumber()
  @Env('APP_RELEASE')
  release: number

  @IsBoolean()
  @Env('APP_REQUEST_LOGGING')
  requestLogging: boolean

  @IsString()
  @Env('NODE_ENV')
  nodeEnv: string

  @IsBoolean()
  @Env('CACHE_ENABLED', { default: true })
  cacheEnabled: boolean
}
