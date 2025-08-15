import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Role } from '../../auth/roles/roles'
import { EntityPaginationQueryInterface } from '../../helpers/pagination/interfaces/entity-pagination-query.interface'
import { PaginationQuery } from '../../helpers/pagination/pagination-query.dto'
import { SelectType, UserSelectType } from './user-select-type.enum'

//define user filter params
export class UserFilter {
  @IsOptional()
  @IsEnum(Role)
  role: string
}

//user pagination query has filter and select type entity and that is also extends pagination query too.
export class UserPaginationQuery
  extends PaginationQuery
  implements EntityPaginationQueryInterface
{
  @IsOptional()
  @ApiProperty()
  @ValidateNested()
  @Type(() => UserFilter)
  filter: UserFilter = new UserFilter()

  @IsOptional()
  @IsEnum(SelectType)
  @ApiPropertyOptional()
  selectType: string = SelectType.DEFAULT

  public getPaginationOptions() {

    return {
      ...this.getDefaultPaginationOptions(),
      ...UserSelectType[this.selectType]
    }
  }
}

export class UserSelectTypeQuery {
  @IsOptional()
  @IsEnum(SelectType)
  @ApiPropertyOptional()
  selectType: string = SelectType.DEFAULT

  public getOptions() {
    return UserSelectType[this.selectType]
  }
}
