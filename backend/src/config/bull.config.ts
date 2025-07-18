import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class BullConfig {
  @IsString()
  @IsNotEmpty()
  @Env('BULL_REDIS_HOST')
  bullHost: string

  @IsNotEmpty()
  @IsNumber()
  @Env('BULL_REDIS_PORT')
  bullRedisPort: number
}
