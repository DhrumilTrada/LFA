import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { delay } from 'lodash';
import { BullQueue } from './constants/bull-queue-constant';

@Injectable()
export class BullConfigService {

  private readonly logger = new Logger(BullConfigService.name);
  constructor(
    @InjectQueue(BullQueue.MAIL_QUEUE) private readonly mailQueue: Queue,
  ){}
 
  async resetPasswordRequestMailQueue(userData, link){
    this.logger.log("resetPasswordRequestMailQueue", userData)
    await this.mailQueue.add('resetpasswordrequest', {userData, link})
  }


  async resetPasswordMailQueue(userData){
    this.logger.log("resetPasswordMailQueue", userData)
    await this.mailQueue.add('resetpassword', {userData})
  }
}
