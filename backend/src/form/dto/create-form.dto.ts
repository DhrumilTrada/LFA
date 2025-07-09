import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, IsOptional } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({ example: 'Contact Form' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: { fields: [{ fieldName: 'email', type: 'string', required: true }] } })
  @IsNotEmpty()
  @IsObject()
  schema: Record<string, any>;

  @ApiPropertyOptional({ example: { email: 'test@example.com' } })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
