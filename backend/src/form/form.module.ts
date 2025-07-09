import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Form, FormSchema } from './schemas/form.schema';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { AuthModule } from '../auth/auth.module';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Form.name, schema: FormSchema }]),
    forwardRef(() => AuthModule),
    CustomCacheModule,
  ],
  controllers: [FormController],
  providers: [FormService],
  exports: [FormService],
})
export class FormModule {}
