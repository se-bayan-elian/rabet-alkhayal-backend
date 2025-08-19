import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { QueryOptionsMapper } from '../common/repository/mappers/query-options.mapper';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ProductsService.name);
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.info(`Creating product: ${createProductDto.name}`);
    return this.productsRepository.create(createProductDto);
  }

  async findAll(queryOptionsDto: QueryOptionsDto) {
    this.logger.info(
      'Fetching products with advanced filtering, search, and pagination',
    );
    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);

    // Always include relations for products
    queryOptions.relations = [
      'subcategory',
      'options',
      'options.values',
      ...(queryOptions.relations || []),
    ];

    return this.productsRepository.findManyWithPagination(queryOptions);
  }

  async findBySubcategory(
    subcategoryId: string,
    queryOptionsDto: QueryOptionsDto,
  ) {
    this.logger.info(`Fetching products for subcategory: ${subcategoryId}`);
    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);
    return this.productsRepository.findBySubcategoryId(
      subcategoryId,
      queryOptions,
    );
  }

  async findOne(id: string): Promise<Product> {
    this.logger.info(`Fetching product with ID: ${id}`);
    return this.productsRepository.findOne({
      where: { id },
      relations: ['subcategory', 'options', 'options.values'],
    });
  }

  async update(
    id: string,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<Product> {
    this.logger.info(`Updating product with ID: ${id}`);

    // Extract only product fields, exclude options
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { options, ...productData } = updateProductDto;

    return this.productsRepository.updateById(id, productData);
  }

  async remove(id: string): Promise<void> {
    this.logger.info(`Soft deleting product with ID: ${id}`);
    await this.productsRepository.softDeleteById(id);
  }

  async restore(id: string): Promise<void> {
    this.logger.info(`Restoring product with ID: ${id}`);
    await this.productsRepository.restoreById(id);
  }

  async getFeaturedProducts(
    mode: 'manual' | 'auto' = 'manual',
    limit: number = 8,
  ): Promise<Product[]> {
    this.logger.info(
      `Fetching featured products with mode: ${mode}, limit: ${limit}`,
    );

    if (mode === 'manual') {
      // Get products marked as featured
      return this.productsRepository.findMany({
        filters: [{ field: 'isFeatured', operator: 'eq', value: true }],
        relations: ['subcategory', 'options', 'options.values'],
        pagination: { page: 1, limit: limit },
        sort: [{ field: 'createdAt', direction: 'DESC' }],
      });
    } else {
      // Get most sold products (auto mode)
      // Query products by sales count from completed orders
      return this.productsRepository.findMostSoldProducts(limit);
    }
  }
}
