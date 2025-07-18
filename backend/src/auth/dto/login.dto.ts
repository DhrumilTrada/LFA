import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UserLoginDto {
  @ApiProperty({ example: 'admin@lfa.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  username: string

  @ApiProperty({ example: 'admin@123' })
  @IsNotEmpty()
  @IsString()
  password: string
}
