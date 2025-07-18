import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { EditorialSelectTypeEnum, EditorialSelectType } from './editorial-select-type.enum';
import { EntityPaginationQueryInterface } from '../../helpers/pagination/interfaces/entity-pagination-query.interface';
import { PaginationQuery } from '../../helpers/pagination/pagination-query.dto';

export class EditorialFilter {
  @IsOptional()
  @ApiPropertyOptional()
  status?: string;
}

export class EditorialPaginationQuery extends PaginationQuery implements EntityPaginationQueryInterface {
  @IsOptional()
  @ApiProperty()
  @ValidateNested()
  @Type(() => EditorialFilter)
  filter: EditorialFilter = new EditorialFilter();

  @IsOptional()
  @IsEnum(EditorialSelectTypeEnum)
  @ApiPropertyOptional()
  selectType: string = EditorialSelectTypeEnum.DEFAULT;

  public getPaginationOptions() {
    return {
      ...this.getDefaultPaginationOptions(),
      ...EditorialSelectType[this.selectType],
    };
  }
}

export class EditorialSelectTypeQuery {
  @IsOptional()
  @IsEnum(EditorialSelectTypeEnum)
  @ApiPropertyOptional()
  selectType: string = EditorialSelectTypeEnum.DEFAULT;

  public getOptions() {
    return EditorialSelectType[this.selectType];
  }
}
