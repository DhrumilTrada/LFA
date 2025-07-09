import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class CreateGalleryDto {
  @ApiProperty({ example: 'image.jpg' })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({ example: 'Gallery Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Nature' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Description of the gallery image' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 2025 })
  @IsNotEmpty()
  @IsNumber()
  year: number;
}
