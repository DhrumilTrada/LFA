import { IsDateString, IsNotEmpty } from 'class-validator'

export class AddJwtTokenDto {
  @IsNotEmpty()
  token: string

  @IsNotEmpty()
  @IsDateString()
  createdAt: Date

  @IsNotEmpty()
  userSessionDetails: any
}
