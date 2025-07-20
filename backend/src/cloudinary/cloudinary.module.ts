// cloudinary.module.ts
import { Module, Global } from '@nestjs/common';
import { CloudinaryConfig } from 'src/config/cloudinary.config';
import { CloudinaryService } from './cloudinary.service';

@Global()
@Module({
  providers: [
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      useFactory: (configService: CloudinaryConfig) => {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: configService.cloudName,
          api_key: configService.apiKey,
          api_secret: configService.apiSecret,
        });
        return cloudinary;
      },
      inject: [CloudinaryConfig],
    },
  ],
  exports: [CloudinaryService],
  controllers: [],
})
export class CloudinaryModule {}
