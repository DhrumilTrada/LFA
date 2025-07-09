import { Module } from '@nestjs/common';
import { BullConfigService } from './bull-config.service';
import { BullModule } from '@nestjs/bull'
import { BullQueue } from './constants/bull-queue-constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BullQueue.MAIL_QUEUE
    }
    ),
  ],
  controllers: [],
  providers: [BullConfigService],
  exports: [BullConfigService]
})
export class BullConfigModule {}
