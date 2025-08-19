import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ParseJson } from '../../decorators/parse-json.decorator';
import { ParseJsonArray } from '../../decorators/parse-json-array.decorator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (starting from 1)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class SortDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @IsString()
  field: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsEnum(['ASC', 'DESC'])
  direction: 'ASC' | 'DESC';
}

export class FilterDto {
  @ApiPropertyOptional({
    description: 'Field to filter by',
    example: 'status',
  })
  @IsString()
  field: string;

  @ApiPropertyOptional({
    description: 'Filter operator',
    enum: [
      'eq',
      'ne',
      'gt',
      'gte',
      'lt',
      'lte',
      'like',
      'ilike',
      'in',
      'nin',
      'between',
      'isNull',
      'isNotNull',
    ],
    example: 'eq',
  })
  @IsEnum([
    'eq',
    'ne',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'in',
    'nin',
    'between',
    'isNull',
    'isNotNull',
  ])
  operator: string;

  @ApiPropertyOptional({
    description: 'Filter value',
    example: 'active',
  })
  @IsOptional()
  value?: any;

  @ApiPropertyOptional({
    description: 'Filter values for array operations (in, nin, between)',
    type: [String],
    example: ['active', 'inactive'],
  })
  @IsOptional()
  @IsArray()
  values?: any[];
}

export class SearchDto {
  @ApiPropertyOptional({
    description: 'Search query string',
    example: 'john doe',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Fields to search in',
    type: [String],
    example: ['name', 'email', 'username'],
  })
  @ParseJson()
  @IsArray()
  @IsString({ each: true })
  fields: string[];

  @ApiPropertyOptional({
    description: 'Search operator (AND/OR)',
    enum: ['AND', 'OR'],
    default: 'OR',
    example: 'OR',
  })
  @IsOptional()
  @IsEnum(['AND', 'OR'])
  operator?: 'AND' | 'OR' = 'OR';
}

export class QueryOptionsDto {
  @ApiPropertyOptional({
    description: 'Pagination options',
    type: PaginationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto;

  @ApiPropertyOptional({
    description: 'Sort options',
    type: [SortDto],
  })
  @IsOptional()
  @ParseJsonArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  sort?: SortDto[];

  @ApiPropertyOptional({
    description: 'Filter options',
    type: [FilterDto],
  })
  @IsOptional()
  @ParseJsonArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters?: FilterDto[];

  @ApiPropertyOptional({
    description: 'Search options',
    type: SearchDto,
  })
  @IsOptional()
  @ParseJson()
  @ValidateNested()
  @Type(() => SearchDto)
  search?: SearchDto;

  @ApiPropertyOptional({
    description: 'Relations to include',
    type: [String],
    example: ['user', 'category'],
  })
  @IsOptional()
  @ParseJson()
  @IsArray()
  @IsString({ each: true })
  relations?: string[];

  @ApiPropertyOptional({
    description: 'Include soft deleted records',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withDeleted?: boolean = false;
}
