import {
  IsEmail,
  IsIn,
  IsNumber,
  IsNotEmpty,
  MinLength,
  ValidateIf,
  IsString,
  IsBoolean
} from 'class-validator'
import { Role } from '../../auth/roles/roles'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CreateUserDto {
  @ApiProperty({ example: 'test' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'abc@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string

  @ApiProperty({ example: 1234567890 })
  @IsNumber()
  phno: number

  @ApiProperty({ example: 'user' })
  @IsIn([Role.SUPER_ADMIN, Role.USER, Role.ADMIN], {
    message: 'Invalid role provided'
  })
  role: string

  @IsString()
  @MinLength(8)
  @ValidateIf((o) => o.password !== null)
  password: string

  @IsBoolean()
  isActive: boolean
}
