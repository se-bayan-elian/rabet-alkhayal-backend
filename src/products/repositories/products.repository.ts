import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { QueryOptions } from '../../common/repository/interfaces/query-options.interface';

@Injectable()
export class ProductsRepository extends BaseRepository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    dataSource: DataSource,
  ) {
    super(productRepository, dataSource);
  }

  /**
   * Find products by subcategory ID
   */
  async findBySubcategoryId(
    subcategoryId: string,
    queryOptions?: QueryOptions<Product>,
  ) {
    const options: QueryOptions<Product> = {
      ...queryOptions,
      filters: [
        ...(queryOptions?.filters || []),
        { field: 'subcategoryId', operator: 'eq', value: subcategoryId },
      ],
      relations: [
        'subcategory',
        'options',
        'options.values',
        ...(queryOptions?.relations || []),
      ],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Find products by category ID (through subcategory)
   */
  async findByCategoryId(
    categoryId: string,
    queryOptions?: QueryOptions<Product>,
  ) {
    const queryBuilder = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .leftJoinAndSelect('product.options', 'options')
      .leftJoinAndSelect('options.values', 'values')
      .where('category.id = :categoryId', { categoryId });

    // Apply other query options
    this.applyQueryOptions(queryBuilder, queryOptions);

    const [data, total] = await queryBuilder.getManyAndCount();
    const { pagination = { page: 1, limit: 10 } } = queryOptions || {};
    const { page, limit } = pagination;
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
  }

  /**
   * Search products by name with full relations
   */
  async searchProducts(
    searchQuery: string,
    queryOptions?: QueryOptions<Product>,
  ) {
    const options: QueryOptions<Product> = {
      ...queryOptions,
      search: {
        query: searchQuery,
        fields: ['name'],
        operator: 'OR',
      },
      relations: [
        'subcategory',
        'subcategory.category',
        'options',
        'options.values',
        ...(queryOptions?.relations || []),
      ],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Find products with price range filter
   */
  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
    queryOptions?: QueryOptions<Product>,
  ) {
    const options: QueryOptions<Product> = {
      ...queryOptions,
      filters: [
        ...(queryOptions?.filters || []),
        {
          field: 'discountedPrice',
          operator: 'between',
          values: [minPrice, maxPrice],
        },
      ],
      relations: [
        'subcategory',
        'options',
        'options.values',
        ...(queryOptions?.relations || []),
      ],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Get products with full details
   */
  async findWithDetails(queryOptions?: QueryOptions<Product>) {
    const options: QueryOptions<Product> = {
      ...queryOptions,
      relations: [
        'subcategory',
        'subcategory.category',
        'options',
        'options.values',
        ...(queryOptions?.relations || []),
      ],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Check if product name exists in subcategory
   */
  async nameExistsInSubcategory(
    name: string,
    subcategoryId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.createQueryBuilder('product')
      .where('product.name = :name', { name })
      .andWhere('product.subcategoryId = :subcategoryId', { subcategoryId });

    if (excludeId) {
      queryBuilder.andWhere('product.id != :id', { id: excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    return this.query(`
      SELECT 
        COUNT(*) as total_products,
        AVG(discounted_price) as average_price,
        MIN(discounted_price) as min_price,
        MAX(discounted_price) as max_price,
        COUNT(DISTINCT subcategory_id) as categories_count
      FROM products
    `);
  }

  /**
   * Get products by subcategory with stats
   */
  async getProductsBySubcategoryWithStats() {
    return this.query(`
      SELECT 
        s.id as subcategory_id,
        s.name as subcategory_name,
        c.id as category_id,
        c.name as category_name,
        COUNT(p.id) as product_count,
        AVG(p.discounted_price) as average_price,
        MIN(p.discounted_price) as min_price,
        MAX(p.discounted_price) as max_price
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN products p ON s.id = p.subcategory_id
      GROUP BY s.id, s.name, c.id, c.name
      ORDER BY c.name ASC, s.name ASC
    `);
  }

  /**
   * Find most sold products based on completed orders
   */
  async findMostSoldProducts(limit: number = 8): Promise<Product[]> {
    const queryBuilder = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('product.options', 'options')
      .leftJoinAndSelect('options.values', 'values')
      .leftJoin('product.cartItems', 'cartItem')
      .leftJoin('cartItem.cart', 'cart')
      .leftJoin('cart.orders', 'order')
      .where('order.orderStatus = :orderStatus', { orderStatus: 'completed' })
      .andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: 'paid',
      })
      .groupBy('product.id')
      .addGroupBy('subcategory.id')
      .addGroupBy('options.id')
      .addGroupBy('values.id')
      .orderBy('SUM(cartItem.quantity)', 'DESC')
      .limit(limit);

    return queryBuilder.getMany();
  }
}
