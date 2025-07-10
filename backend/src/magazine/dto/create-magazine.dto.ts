import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn, IsNumber, IsDateString } from 'class-validator';

export class CreateMagazineDto {
  @ApiProperty({ example: 'Magazine Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Issue 1' })
  @IsNotEmpty()
  @IsString()
  issueNumber: string;

  @ApiProperty({ example: 'Editor Name' })
  @IsNotEmpty()
  @IsString()
  editor: string;

  @ApiProperty({ example: 'draft', enum: ['draft', 'published', 'archived'] })
  @IsNotEmpty()
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  status: string;

  @ApiPropertyOptional({ example: 'Description of the magazine' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2023 })
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @ApiPropertyOptional({ example: 'image.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'magazine.pdf' })
  @IsNotEmpty()
  @IsString()
  pdf: string;

  @ApiProperty({ example: '2023-10-01T00:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  uploadedAt: string;

  @ApiProperty({ example: 1024 })
  @IsNotEmpty()
  @IsNumber()
  size: number;
}
