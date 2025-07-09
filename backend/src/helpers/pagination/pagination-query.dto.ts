import { Prop } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsObject, IsOptional } from 'class-validator'

export class PaginationQuery {
  @ApiProperty({
    minimum: 0,
    maximum: 100000000,
    title: 'Page',
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    type: Number,
    default: 1
  })
  @Prop({ default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit: number

  @ApiPropertyOptional({
    name: 'sort'
  })
  @IsOptional()
  @IsObject()
  sort: Record<string, number>

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true' || value === true || value === 1 || value === '1'
  })
  pagination: boolean

  protected getDefaultPaginationOptions(): any {
    console.log('default pagination option in pagination query', this.page)

    const defaultPagination = {
      page: this.page,
      limit: this.limit,
      sort: this.sort,
      pagination: this.pagination
    } 

    return Object.keys(defaultPagination).reduce((acc, key) => {
      if (defaultPagination[key] !== undefined) {
        acc[key] = defaultPagination[key];
      }
      return acc;
    }, {})
  }
}
