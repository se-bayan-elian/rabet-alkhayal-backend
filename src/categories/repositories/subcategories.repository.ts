import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subcategory } from '../entities/subcategory.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { QueryOptions } from '../../common/repository/interfaces/query-options.interface';

@Injectable()
export class SubcategoriesRepository extends BaseRepository<Subcategory> {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    dataSource: DataSource,
  ) {
    super(subcategoryRepository, dataSource);
  }

  /**
   * Find subcategories by category ID
   */
  async findByCategoryId(
    categoryId: string,
    queryOptions?: QueryOptions<Subcategory>,
  ) {
    const options: QueryOptions<Subcategory> = {
      ...queryOptions,
      filters: [
        ...(queryOptions?.filters || []),
        { field: 'categoryId', operator: 'eq', value: categoryId },
      ],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Find subcategory by name within a category
   */
  async findByNameInCategory(
    name: string,
    categoryId: string,
  ): Promise<Subcategory | null> {
    return this.findOne({
      where: { name, categoryId },
      relations: ['category'],
    });
  }

  /**
   * Check if subcategory name exists in category
   */
  async nameExistsInCategory(
    name: string,
    categoryId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.createQueryBuilder('subcategory')
      .where('subcategory.name = :name', { name })
      .andWhere('subcategory.categoryId = :categoryId', { categoryId });

    if (excludeId) {
      queryBuilder.andWhere('subcategory.id != :id', { id: excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Get subcategories with product count
   */
  async getSubcategoriesWithProductCount(categoryId?: string) {
    let query = `
      SELECT 
        s.id,
        s.name,
        s.category_id,
        s.created_at,
        s.updated_at,
        c.name as category_name,
        COUNT(p.id) as product_count
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN products p ON s.id = p.subcategory_id
    `;

    const params = [];
    if (categoryId) {
      query += ' WHERE s.category_id = $1';
      params.push(categoryId);
    }

    query += `
      GROUP BY s.id, s.name, s.category_id, s.created_at, s.updated_at, c.name
      ORDER BY c.name ASC, s.name ASC
    `;

    return this.query(query, params);
  }
}
