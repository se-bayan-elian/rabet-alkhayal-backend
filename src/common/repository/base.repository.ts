import {
  Repository,
  SelectQueryBuilder,
  FindOneOptions,
  DeepPartial,
  DataSource,
} from 'typeorm';
import { QueryFailedError } from 'typeorm/error/QueryFailedError';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  QueryOptions,
  PaginatedResult,
  FilterCondition,
  SortOption,
  SearchOption,
} from './interfaces/query-options.interface';
import { IBaseRepository } from './interfaces/base-repository.interface';

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected repository: Repository<T>;
  protected dataSource: DataSource;

  constructor(repository: Repository<T>, dataSource: DataSource) {
    this.repository = repository;
    this.dataSource = dataSource;
  }

  /**
   * Get entity name for error messages
   */
  protected get entityName(): string {
    return this.repository.metadata.targetName;
  }

  /**
   * Create a new entity
   */
  async create(entityData: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(entityData);
      return await this.repository.save(entity);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  /**
   * Create multiple entities
   */
  async createMany(entitiesData: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = this.repository.create(entitiesData);
      return await this.repository.save(entities);
    } catch (error) {
      this.handleError(error, 'createMany');
    }
  }

  /**
   * Find entity by ID
   */
  async findById(
    id: string | number,
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T> {
    try {
      const entity = await this.repository.findOne({
        where: { id } as any,
        ...options,
      });

      if (!entity) {
        throw new NotFoundException(
          `${this.entityName} with ID ${id} not found`,
        );
      }

      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleError(error, 'findById');
    }
  }

  /**
   * Find entity by ID or throw error
   */
  async findByIdOrThrow(id: string | number): Promise<T> {
    return this.findById(id);
  }

  /**
   * Find one entity with options
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    try {
      return await this.repository.findOne(options);
    } catch (error) {
      this.handleError(error, 'findOne');
    }
  }

  /**
   * Find one entity with options or throw error
   */
  async findOneOrFail(options: FindOneOptions<T>): Promise<T> {
    try {
      const entity = await this.repository.findOne(options);

      if (!entity) {
        throw new NotFoundException(`${this.entityName} not found`);
      }

      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleError(error, 'findOneOrFail');
    }
  }

  /**
   * Find entities with advanced query options
   */
  async findMany(queryOptions?: QueryOptions<T>): Promise<T[]> {
    try {
      const queryBuilder = this.createQueryBuilder();
      this.applyQueryOptions(queryBuilder, queryOptions);

      return await queryBuilder.getMany();
    } catch (error) {
      this.handleError(error, 'findMany');
    }
  }

  /**
   * Find entities with pagination
   */
  async findManyWithPagination(
    queryOptions?: QueryOptions<T>,
  ): Promise<PaginatedResult<T>> {
    try {
      const queryBuilder = this.createQueryBuilder();
      this.applyQueryOptions(queryBuilder, queryOptions);

      const { pagination = { page: 1, limit: 10 } } = queryOptions || {};
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.log(error);
      this.handleError(error, 'findManyWithPagination');
    }
  }

  /**
   * Find entities with pagination and advanced options
   */
  async findManyPaginated(options: {
    page?: number;
    limit?: number;
    filters?: any;
    relations?: string[];
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<PaginatedResult<T>> {
    try {
      const {
        page = 1,
        limit = 10,
        filters = {},
        relations = [],
        sortBy,
        sortOrder = 'DESC',
      } = options;

      const queryBuilder = this.createQueryBuilder();

      // Apply relations
      relations.forEach((relation) => {
        queryBuilder.leftJoinAndSelect(
          `${queryBuilder.alias}.${relation}`,
          relation,
        );
      });

      // Apply filters
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined) {
          queryBuilder.andWhere(`${queryBuilder.alias}.${key} = :${key}`, {
            [key]: filters[key],
          });
        }
      });

      // Apply sorting
      if (sortBy) {
        queryBuilder.orderBy(`${queryBuilder.alias}.${sortBy}`, sortOrder);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      this.handleError(error, 'findManyPaginated');
    }
  }

  /**
   * Update entity by ID
   */
  async updateById(id: string | number, updateData: Partial<T>): Promise<T> {
    try {
      const entity = await this.findById(id);
      Object.assign(entity, updateData);
      return await this.repository.save(entity);
    } catch (error) {
      this.handleError(error, 'updateById');
    }
  }

  /**
   * Update entities with conditions
   */
  async updateMany(
    criteria: Partial<T>,
    updateData: Partial<T>,
  ): Promise<void> {
    try {
      await this.repository.update(criteria as any, updateData as any);
    } catch (error) {
      this.handleError(error, 'updateMany');
    }
  }

  /**
   * Soft delete entity by ID
   */
  async softDeleteById(id: string | number): Promise<void> {
    try {
      const result = await this.repository.softDelete(id);

      if (result.affected === 0) {
        throw new NotFoundException(
          `${this.entityName} with ID ${id} not found`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleError(error, 'softDeleteById');
    }
  }

  /**
   * Hard delete entity by ID
   */
  async deleteById(id: string | number): Promise<void> {
    try {
      const result = await this.repository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(
          `${this.entityName} with ID ${id} not found`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleError(error, 'deleteById');
    }
  }

  /**
   * Restore soft deleted entity by ID
   */
  async restoreById(id: string | number): Promise<void> {
    try {
      const result = await this.repository.restore(id);

      if (result.affected === 0) {
        throw new NotFoundException(
          `${this.entityName} with ID ${id} not found`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleError(error, 'restoreById');
    }
  }

  /**
   * Count entities with conditions
   */
  async count(queryOptions?: QueryOptions<T>): Promise<number> {
    try {
      const queryBuilder = this.createQueryBuilder();
      this.applyQueryOptions(queryBuilder, queryOptions);

      return await queryBuilder.getCount();
    } catch (error) {
      this.handleError(error, 'count');
    }
  }

  /**
   * Check if entity exists
   */
  async exists(criteria: Partial<T>): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: criteria as any });
      return count > 0;
    } catch (error) {
      this.handleError(error, 'exists');
    }
  }

  /**
   * Execute raw query
   */
  async query(sql: string, parameters?: any[]): Promise<any> {
    try {
      return await this.repository.query(sql, parameters);
    } catch (error) {
      this.handleError(error, 'query');
    }
  }

  /**
   * Create query builder
   */
  protected createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(
      alias || this.entityName.toLowerCase(),
    );
  }

  /**
   * Apply query options to query builder
   */
  protected applyQueryOptions(
    queryBuilder: SelectQueryBuilder<T>,
    queryOptions?: QueryOptions<T>,
  ): void {
    if (!queryOptions) return;

    const alias = queryBuilder.alias;

    // Apply relations
    if (queryOptions.relations?.length) {
      const appliedRelations = new Set<string>();

      queryOptions.relations.forEach((relation) => {
        // Handle nested relations like 'options.values'
        if (relation.includes('.')) {
          const parts = relation.split('.');
          let currentAlias = alias;

          for (let i = 0; i < parts.length; i++) {
            const relationKey = `${currentAlias}.${parts[i]}`;
            const relationAlias = parts[i];

            if (!appliedRelations.has(relationKey)) {
              queryBuilder.leftJoinAndSelect(relationKey, relationAlias);
              appliedRelations.add(relationKey);
            }

            currentAlias = relationAlias;
          }
        } else {
          // Handle simple relations
          const relationKey = `${alias}.${relation}`;
          if (!appliedRelations.has(relationKey)) {
            queryBuilder.leftJoinAndSelect(relationKey, relation);
            appliedRelations.add(relationKey);
          }
        }
      });
    }

    // Apply select fields
    if (queryOptions.select?.length) {
      const selectFields = queryOptions.select.map(
        (field) => `${alias}.${String(field)}`,
      );
      queryBuilder.select(selectFields);
    }

    // Apply filters
    if (queryOptions.filters?.length) {
      this.applyFilters(queryBuilder, queryOptions.filters, alias);
    }

    // Apply search
    if (queryOptions.search) {
      this.applySearch(queryBuilder, queryOptions.search, alias);
    }

    // Apply sorting
    if (queryOptions.sort?.length) {
      this.applySorting(queryBuilder, queryOptions.sort, alias);
    }

    // Apply soft delete option
    if (queryOptions.withDeleted) {
      queryBuilder.withDeleted();
    }
  }

  /**
   * Apply filters to query builder
   */
  protected applyFilters(
    queryBuilder: SelectQueryBuilder<T>,
    filters: FilterCondition[],
    alias: string,
  ): void {
    filters.forEach((filter, index) => {
      const paramName = `filter_${index}`;
      const fieldName = `${alias}.${filter.field}`;

      switch (filter.operator) {
        case 'eq':
          queryBuilder.andWhere(`${fieldName} = :${paramName}`, {
            [paramName]: filter.value,
          });
          break;
        case 'ne':
          queryBuilder.andWhere(`${fieldName} != :${paramName}`, {
            [paramName]: filter.value,
          });
          break;
        case 'gt':
          queryBuilder.andWhere(`${fieldName} > :${paramName}`, {
            [paramName]: filter.value,
          });
          break;
        case 'gte':
          queryBuilder.andWhere(`${fieldName} >= :${paramName}`, {
            [paramName]: filter.value,
          });
          break;
        case 'lt':
          queryBuilder.andWhere(`${fieldName} < :${paramName}`, {
            [paramName]: filter.value,
          });
          break;
        case 'lte':
          queryBuilder.andWhere(`${fieldName} <= :${paramName}`, {
            [paramName]: filter.value,
          });
          break;
        case 'like':
          queryBuilder.andWhere(`${fieldName} LIKE :${paramName}`, {
            [paramName]: `%${filter.value}%`,
          });
          break;
        case 'ilike':
          queryBuilder.andWhere(`${fieldName} ILIKE :${paramName}`, {
            [paramName]: `%${filter.value}%`,
          });
          break;
        case 'in':
          if (filter.values?.length) {
            queryBuilder.andWhere(`${fieldName} IN (:...${paramName})`, {
              [paramName]: filter.values,
            });
          }
          break;
        case 'nin':
          if (filter.values?.length) {
            queryBuilder.andWhere(`${fieldName} NOT IN (:...${paramName})`, {
              [paramName]: filter.values,
            });
          }
          break;
        case 'between':
          if (filter.values?.length === 2) {
            queryBuilder.andWhere(
              `${fieldName} BETWEEN :${paramName}_start AND :${paramName}_end`,
              {
                [`${paramName}_start`]: filter.values[0],
                [`${paramName}_end`]: filter.values[1],
              },
            );
          }
          break;
        case 'isNull':
          queryBuilder.andWhere(`${fieldName} IS NULL`);
          break;
        case 'isNotNull':
          queryBuilder.andWhere(`${fieldName} IS NOT NULL`);
          break;
      }
    });
  }

  /**
   * Apply search to query builder
   */
  protected applySearch(
    queryBuilder: SelectQueryBuilder<T>,
    search: SearchOption,
    alias: string,
  ): void {
    if (!search.query || !search.fields?.length) return;

    const searchConditions = search.fields.map((field, index) => {
      const paramName = `search_${index}`;
      const fieldName = `${alias}.${field}`;
      queryBuilder.setParameter(paramName, `%${search.query}%`);
      return `${fieldName} ILIKE :${paramName}`;
    });

    const operator = search.operator === 'AND' ? ' AND ' : ' OR ';
    const whereClause = `(${searchConditions.join(operator)})`;

    queryBuilder.andWhere(whereClause);
  }

  /**
   * Apply sorting to query builder
   */
  protected applySorting(
    queryBuilder: SelectQueryBuilder<T>,
    sorts: SortOption[],
    alias: string,
  ): void {
    sorts.forEach((sort, index) => {
      const fieldName = `${alias}.${sort.field}`;
      if (index === 0) {
        queryBuilder.orderBy(fieldName, sort.direction);
      } else {
        queryBuilder.addOrderBy(fieldName, sort.direction);
      }
    });
  }

  /**
   * Handle repository errors
   */
  protected handleError(error: any, operation: string): never {
    console.error(
      `Error in ${this.entityName} repository - ${operation}:`,
      error,
    );

    if (error instanceof QueryFailedError) {
      if (error.message.includes('duplicate key')) {
        throw new BadRequestException(`${this.entityName} already exists`);
      }
      if (error.message.includes('violates foreign key constraint')) {
        throw new BadRequestException('Referenced entity does not exist');
      }
      if (error.message.includes('invalid input syntax for type uuid')) {
        const uuidMatch = error.message.match(/"([^"]+)"/);
        const invalidValue = uuidMatch ? uuidMatch[1] : 'provided value';
        throw new BadRequestException(
          `Invalid UUID format: "${invalidValue}". Please provide a valid UUID.`,
        );
      }
    }

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Failed to ${operation} ${this.entityName}`,
    );
  }
}
