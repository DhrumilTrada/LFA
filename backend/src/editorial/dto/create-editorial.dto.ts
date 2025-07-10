import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn, IsArray, IsBoolean } from 'class-validator';

export class CreateEditorialDto {
  @ApiProperty({ example: 'Editorial Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Opinion' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 'draft', enum: ['draft', 'published', 'archived'] })
  @IsNotEmpty()
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  status: string;

  @ApiPropertyOptional({ example: 'Short excerpt' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: 'Full editorial content' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
