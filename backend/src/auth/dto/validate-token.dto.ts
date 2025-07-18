import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ValidateTokenDto {
  @IsNotEmpty({
    message: 'password reset token is required for resetting password'
  })
  @ApiProperty({
    example:
      'g9sxHgOaJapSwW8vTFLvNUZCWNAM0oTg2KqeUPq3M94WbJJnuLabCC8l41FbUfuieO5BoFDNiYaBhKnX9ZGG8mb4cxpYU'
  })
  @IsString()
  resetPasswordToken: string
}
