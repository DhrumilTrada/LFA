import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ResetPasswordTokenDto {
  @ApiProperty({
    example:
      'g9sxHgOaJapSwW8vTFLvNUZCWNAM0oTg2KqeUPq3M94WbJJnuLabCC8l41FbUfuieO5BoFDNiYaBhKnX9ZGG8mb4cxpYU'
  })
  @IsString()
  @IsNotEmpty()
  resetPasswordToken: string

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @IsString()
  password: string
}
