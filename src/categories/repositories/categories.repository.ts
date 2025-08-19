import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { QueryOptions } from '../../common/repository/interfaces/query-options.interface';

@Injectable()
export class CategoriesRepository extends BaseRepository<Category> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    dataSource: DataSource,
  ) {
    super(categoryRepository, dataSource);
  }

  /**
   * Find category by name
   */
  async findByName(name: string): Promise<Category | null> {
    return this.findOne({ where: { name } });
  }

  /**
   * Find categories with subcategories
   */
  async findWithSubcategories(queryOptions?: QueryOptions<Category>) {
    const options: QueryOptions<Category> = {
      ...queryOptions,
      relations: ['subcategories', ...(queryOptions?.relations || [])],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Check if category name exists
   */
  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.createQueryBuilder('category').where(
      'category.name = :name',
      { name },
    );

    if (excludeId) {
      queryBuilder.andWhere('category.id != :id', { id: excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Get categories with product count
   */
  async getCategoriesWithProductCount() {
    return this.query(`
      SELECT 
        c.id,
        c.name,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT s.id) as subcategory_count,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      LEFT JOIN products p ON s.id = p.subcategory_id
      GROUP BY c.id, c.name, c.created_at, c.updated_at
      ORDER BY c.name ASC
    `);
  }
}
