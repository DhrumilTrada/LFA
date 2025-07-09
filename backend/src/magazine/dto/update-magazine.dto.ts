import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateMagazineDto } from './create-magazine.dto';

export class UpdateMagazineDto extends PartialType(CreateMagazineDto) {
  @IsOptional()
  @IsString()
  pdf?: string;
}
