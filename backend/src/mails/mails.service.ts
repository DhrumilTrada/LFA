import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { MailConfig } from '../config/mail.config'
import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

@Injectable()
@Processor('mail-queue')
export class MailsService {
  private readonly logger = new Logger(MailsService.name)

  constructor(
    private readonly mailConfig: MailConfig,
    private mailerService: MailerService
  ) {}

  //template test mail
  async sendMail(email: string, name: string) {

    await this.mailerService.sendMail({
      to: email,
      subject: 'Greeting from NestJS NodeMailer',
      template: './email',
      context: {
        name: name
      }
    })
  }

  @Process('resetpasswordrequest')
  async resetPasswordRequestData(job: Job) {
    console.log(
      'job data of resetpasswordrequest',
      JSON.stringify(job.data.userData, job.data.link)
    )
    const user = job.data.userData
    const link = job.data.link
    this.resetPasswordEmail(user, link)
  }
  // password change request email
  async resetPasswordEmail(user, link) {
    console.log(user, link)

    const data = {
      from: this.mailConfig.fromEmail,
      to: user.email,
      subject: 'Password change request',
      html: `Hi ${user.name},<BR> <BR>
       Please <a href="${link}">click here</a> to set your password. <BR> <BR>
       If you did not request this, please ignore this email and your password will remain unchanged. <BR> <BR>`
    }

    await this.mailerService
      .sendMail(data)
      .then((msg) => {
        console.log('Password change request sent successfully:' + msg)
        return msg
      })
      .catch((err) => {
        this.logger.log('err:' + err)
        return err
      })
  }

  @Process('resetpassword')
  async data(job: Job) {
    console.log('job data', JSON.stringify(job.data))
    const jobData = job.data
    this.sendConfirmedResetPasswordEmail(jobData)
  }
  async sendConfirmedResetPasswordEmail(updatedData) {
    const data = {
      to: updatedData.email,
      from: this.mailConfig.fromEmail,
      subject: 'Your password has been changed',
      html: `Hi ${updatedData.name}, <BR> <BR> 
      This is a confirmation that the password for your account ${updatedData.email} has just been changed. <BR><BR>
      `
    }

    await this.mailerService
      .sendMail(data)
      .then((msg) => {
        this.logger.log('Password change request sent successfully:' + msg)
        return msg
      })
      .catch((err) => {
        this.logger.log('err:' + err)
        return err
      })
  }
}
