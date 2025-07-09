import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UserLoginDto {
  @ApiProperty({ example: 'abc@example.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  username: string

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @IsString()
  password: string
}
