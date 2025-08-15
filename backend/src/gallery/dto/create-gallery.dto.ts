import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class CreateGalleryDto {
  @ApiPropertyOptional({ example: 'image.jpg' })
  @IsOptional()
  image: any;

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
}
