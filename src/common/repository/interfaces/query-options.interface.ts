import { FindManyOptions } from 'typeorm';

export interface SortOption {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface FilterCondition {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'ilike'
    | 'in'
    | 'nin'
    | 'between'
    | 'isNull'
    | 'isNotNull';
  value?: any;
  values?: any[]; // For 'in', 'nin', 'between' operators
}

export interface SearchOption {
  fields: string[];
  query: string;
  operator?: 'AND' | 'OR';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

export interface QueryOptions<T = any> {
  pagination?: PaginationOptions;
  sort?: SortOption[];
  filters?: FilterCondition[];
  search?: SearchOption;
  relations?: string[];
  select?: (keyof T)[];
  withDeleted?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface RepositoryOptions<T = any> extends FindManyOptions<T> {
  queryOptions?: QueryOptions<T>;
}
