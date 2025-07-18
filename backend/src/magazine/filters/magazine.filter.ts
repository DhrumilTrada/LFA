import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { MagazineSelectTypeEnum, MagazineSelectType } from './magazine-select-type.enum';
import { EntityPaginationQueryInterface } from '../../helpers/pagination/interfaces/entity-pagination-query.interface';
import { PaginationQuery } from '../../helpers/pagination/pagination-query.dto';

export class MagazineFilter {
  @IsOptional()
  status:any
}

export class MagazinePaginationQuery extends PaginationQuery implements EntityPaginationQueryInterface {
  @IsOptional()
  @ApiProperty()
  @ValidateNested()
  @Type(() => MagazineFilter)
  filter: MagazineFilter = new MagazineFilter();

  @IsOptional()
  @IsEnum(MagazineSelectTypeEnum)
  @ApiPropertyOptional()
  selectType: string = MagazineSelectTypeEnum.DEFAULT;

  public getPaginationOptions() {
    return {
      ...this.getDefaultPaginationOptions(),
      ...MagazineSelectType[this.selectType],
    };
  }
}

export class MagazineSelectTypeQuery {
  @IsOptional()
  @IsEnum(MagazineSelectTypeEnum)
  @ApiPropertyOptional()
  selectType: string = MagazineSelectTypeEnum.DEFAULT;

  public getOptions() {
    return MagazineSelectType[this.selectType];
  }
}
