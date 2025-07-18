import { IsNotEmpty, IsString } from 'class-validator';
import { Env } from '../config-module/decorators/env.decorator';

export class CloudinaryConfig {
  @IsString()
  @IsNotEmpty()
  @Env('CLOUDINARY_CLOUD_NAME')
  cloudName: string;

  @IsString()
  @IsNotEmpty()
  @Env('CLOUDINARY_API_KEY')
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  @Env('CLOUDINARY_API_SECRET')
  apiSecret: string;
}
