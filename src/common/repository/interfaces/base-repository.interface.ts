import { DeepPartial, FindOneOptions } from 'typeorm';
import { QueryOptions, PaginatedResult } from './query-options.interface';

export interface IBaseRepository<T> {
  // Create operations
  create(entityData: DeepPartial<T>): Promise<T>;
  createMany(entitiesData: DeepPartial<T>[]): Promise<T[]>;

  // Read operations
  findById(
    id: string | number,
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T>;
  findByIdOrThrow(id: string | number): Promise<T>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findOneOrFail(options: FindOneOptions<T>): Promise<T>;
  findMany(queryOptions?: QueryOptions<T>): Promise<T[]>;
  findManyWithPagination(
    queryOptions?: QueryOptions<T>,
  ): Promise<PaginatedResult<T>>;
  findManyPaginated(options: {
    page?: number;
    limit?: number;
    filters?: any;
    relations?: string[];
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<PaginatedResult<T>>;

  // Update operations
  updateById(id: string | number, updateData: Partial<T>): Promise<T>;
  updateMany(criteria: Partial<T>, updateData: Partial<T>): Promise<void>;

  // Delete operations
  softDeleteById(id: string | number): Promise<void>;
  deleteById(id: string | number): Promise<void>;
  restoreById(id: string | number): Promise<void>;

  // Utility operations
  count(queryOptions?: QueryOptions<T>): Promise<number>;
  exists(criteria: Partial<T>): Promise<boolean>;
  query(sql: string, parameters?: any[]): Promise<any>;
}
