import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Env } from '../config-module/decorators/env.decorator'

export class BullConfig {
  @IsString()
  @Env('BULL_REDIS_URL')
  bullRedisUrl?: string;

  @IsString()
  @Env('BULL_REDIS_PASSWORD')
  bullRedisPassword?: string;

  @IsString()
  @IsNotEmpty()
  @Env('BULL_REDIS_HOST')
  bullHost: string;

  @IsNotEmpty()
  @IsNumber()
  @Env('BULL_REDIS_PORT')
  bullRedisPort: number;
}
