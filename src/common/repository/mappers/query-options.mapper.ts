import { Injectable } from '@nestjs/common';
import {
  QueryOptionsDto,
  PaginationDto,
  SortDto,
  FilterDto,
  SearchDto,
} from '../dto/query-options.dto';
import {
  QueryOptions,
  PaginationOptions,
  SortOption,
  FilterCondition,
  SearchOption,
} from '../interfaces/query-options.interface';

@Injectable()
export class QueryOptionsMapper {
  /**
   * Transform QueryOptionsDto to QueryOptions interface
   */
  static transform(dto: QueryOptionsDto): QueryOptions {
    console.log(
      'QueryOptionsMapper.transform - Input DTO:',
      JSON.stringify(dto, null, 2),
    );

    const queryOptions: QueryOptions = {};

    // Transform pagination
    if (dto.pagination) {
      queryOptions.pagination = this.transformPagination(dto.pagination);
    }

    // Transform sort
    if (dto.sort) {
      queryOptions.sort = this.transformSort(dto.sort);
    }

    // Transform filters
    if (dto.filters) {
      queryOptions.filters = this.transformFilters(dto.filters);
    }

    // Transform search
    if (dto.search) {
      queryOptions.search = this.transformSearch(dto.search);
    }

    // Transform relations
    if (dto.relations) {
      queryOptions.relations = dto.relations;
    }

    // Transform withDeleted
    if (dto.withDeleted !== undefined) {
      queryOptions.withDeleted = dto.withDeleted;
    }

    console.log(
      'QueryOptionsMapper.transform - Output QueryOptions:',
      JSON.stringify(queryOptions, null, 2),
    );
    return queryOptions;
  }

  /**
   * Transform pagination DTO to pagination options
   */
  private static transformPagination(dto: PaginationDto): PaginationOptions {
    return {
      page: dto.page,
      limit: dto.limit,
    };
  }

  /**
   * Transform sort DTO to sort options
   */
  private static transformSort(
    dtos: SortDto[] | SortDto | undefined,
  ): SortOption[] {
    console.log(
      'QueryOptionsMapper.transformSort - Input dtos:',
      JSON.stringify(dtos, null, 2),
    );
    console.log(
      'QueryOptionsMapper.transformSort - Type of dtos:',
      typeof dtos,
    );
    console.log(
      'QueryOptionsMapper.transformSort - Is array:',
      Array.isArray(dtos),
    );

    if (!dtos) {
      console.log(
        'QueryOptionsMapper.transformSort - No dtos provided, returning empty array',
      );
      return [];
    }

    // Handle single sort object
    if (!Array.isArray(dtos)) {
      console.log(
        'QueryOptionsMapper.transformSort - Single sort object, converting to array',
      );
      dtos = [dtos];
    }

    const result = dtos.map((dto: SortDto) => ({
      field: dto.field,
      direction: dto.direction,
    }));

    console.log(
      'QueryOptionsMapper.transformSort - Result:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }

  /**
   * Transform filter DTOs to filter conditions
   */
  private static transformFilters(
    dtos: FilterDto[] | FilterDto | undefined,
  ): FilterCondition[] {
    console.log(
      'QueryOptionsMapper.transformFilters - Input dtos:',
      JSON.stringify(dtos, null, 2),
    );
    console.log(
      'QueryOptionsMapper.transformFilters - Type of dtos:',
      typeof dtos,
    );
    console.log(
      'QueryOptionsMapper.transformFilters - Is array:',
      Array.isArray(dtos),
    );

    if (!dtos) {
      console.log(
        'QueryOptionsMapper.transformFilters - No dtos provided, returning empty array',
      );
      return [];
    }

    // Handle single filter object
    if (!Array.isArray(dtos)) {
      console.log(
        'QueryOptionsMapper.transformFilters - Single filter object, converting to array',
      );
      dtos = [dtos];
    }

    const result = dtos.map((dto: FilterDto) => ({
      field: dto.field,
      operator: dto.operator as FilterCondition['operator'],
      value: dto.value,
      values: dto.values,
    }));

    console.log(
      'QueryOptionsMapper.transformFilters - Result:',
      JSON.stringify(result, null, 2),
    );
    return result;
  }

  /**
   * Transform search DTO to search option
   */
  private static transformSearch(dto: SearchDto): SearchOption {
    return {
      query: dto.query,
      fields: dto.fields,
      operator: dto.operator,
    };
  }
}
