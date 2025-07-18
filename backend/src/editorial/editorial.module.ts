import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Editorial, EditorialSchema } from './schemas/editorial.schema';
import { EditorialController } from './editorial.controller';
import { EditorialService } from './editorial.service';
import { AuthModule } from '../auth/auth.module';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Editorial.name, schema: EditorialSchema }]),
    forwardRef(() => AuthModule),
    CustomCacheModule,
  ],
  controllers: [EditorialController],
  providers: [EditorialService],
  exports: [EditorialService],
})
export class EditorialModule {}
