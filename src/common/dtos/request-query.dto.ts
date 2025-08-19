import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SearchDto<T> {
  @ApiPropertyOptional({
    type: [String],
    description: 'Fields to search in',
  })
  @IsArray()
  @IsString({ each: true })
  fields: (keyof T)[];

  @ApiPropertyOptional({
    type: String,
    description: 'Search term',
  })
  @IsString()
  term: string;
}
export class QueryOptionsDto<T> {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({
    type: String,
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sort?: keyof T | string;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Sort order',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Filters to apply',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  filters?: Partial<Record<keyof T, any>>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relations?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  select?: string[];

  @ApiPropertyOptional({
    type: SearchDto,
    description: 'Search configuration',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchDto)
  search?: SearchDto<T>;
}
