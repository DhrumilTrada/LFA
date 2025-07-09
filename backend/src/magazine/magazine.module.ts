import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Magazine, MagazineSchema } from './schemas/magazine.schema';
import { MagazineController } from './magazine.controller';
import { MagazineService } from './magazine.service';
import { AuthModule } from '../auth/auth.module';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Magazine.name, schema: MagazineSchema }]),
    forwardRef(() => AuthModule),
    CustomCacheModule,
  ],
  controllers: [MagazineController],
  providers: [MagazineService],
  exports: [MagazineService],
})
export class MagazineModule {}
