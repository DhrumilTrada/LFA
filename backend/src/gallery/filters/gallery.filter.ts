import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { GallerySelectTypeEnum, GallerySelectType } from './gallery-select-type.enum';
import { EntityPaginationQueryInterface } from '../../helpers/pagination/interfaces/entity-pagination-query.interface';
import { PaginationQuery } from '../../helpers/pagination/pagination-query.dto';

export class GalleryFilter {
  @IsOptional()
  @ApiPropertyOptional()
  category?: string;
}

export class GalleryPaginationQuery extends PaginationQuery implements EntityPaginationQueryInterface {
  @IsOptional()
  @ApiProperty()
  @ValidateNested()
  @Type(() => GalleryFilter)
  filter: GalleryFilter = new GalleryFilter();

  @IsOptional()
  @IsEnum(GallerySelectTypeEnum)
  @ApiPropertyOptional()
  selectType: string = GallerySelectTypeEnum.DEFAULT;

  public getPaginationOptions() {
    return {
      ...this.getDefaultPaginationOptions(),
      ...GallerySelectType[this.selectType],
    };
  }
}

export class GallerySelectTypeQuery {
  @IsOptional()
  @IsEnum(GallerySelectTypeEnum)
  @ApiPropertyOptional()
  selectType: string = GallerySelectTypeEnum.DEFAULT;

  public getOptions() {
    return GallerySelectType[this.selectType];
  }
}
