import {
  IsEmail,
  IsIn,
  IsNumber,
  IsNotEmpty,
  MinLength,
  ValidateIf
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

  // @MinLength(6, {
  //   message: 'Password must be 6 or more characters long'
  // })
  // password: string

  //   @ValidateIf((o) => o.role === 'admin')
  //   @IsNotEmpty()
  //   data: string

  @ApiProperty({ example: 1234567890 })
  @IsNumber()
  phno: number

  /**
   * A list of user's roles
   * @example['admin', 'user']
   */
  @ApiProperty({ example: 'user' })
  @IsIn([Role.SUPER_ADMIN, Role.USER, Role.ADMIN], {
    message: 'Invalid role provided'
  })
  role: string
}
