import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { QueryOptionsMapper } from '../common/repository/mappers/query-options.mapper';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { PinoLogger } from 'nestjs-pino';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly logger: PinoLogger,
    private readonly cloudinaryService: CloudinaryService,
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
      'questions',
      'questions.answers',
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
      relations: ['subcategory', 'questions', 'questions.answers'],
    });
  }

  async update(
    id: string,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<Product> {
    this.logger.info(`Updating product with ID: ${id}`);

    // Extract only product fields, exclude questions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { questions, ...productData } = updateProductDto;

    return this.productsRepository.updateById(id, productData);
  }

  async remove(id: string): Promise<void> {
    this.logger.info(`Deleting product with ID: ${id}`);

    // Find the product to get its Cloudinary public ID
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new Error(`Product with ID '${id}' not found`);
    }

    // Delete associated image from Cloudinary
    if (product.imagePublicId) {
      try {
        await this.cloudinaryService.deleteFile(product.imagePublicId);
        this.logger.info(
          `Deleted product image from Cloudinary: ${product.imagePublicId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete product image from Cloudinary: ${error.message}`,
        );
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    // Delete the product from database
    await this.productsRepository.deleteById(id);
    this.logger.info(`Product deleted successfully: ${id}`);
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
        relations: ['subcategory', 'questions', 'questions.answers'],
        pagination: { page: 1, limit: limit },
        sort: [{ field: 'createdAt', direction: 'DESC' }],
      });
    } else {
      // Get most sold products (auto mode)
      // Query products by sales count from completed orders
      return this.productsRepository.findMostSoldProducts(limit);
    }
  }

  async getRelatedProducts(
    productId: string,
    limit: number = 6,
  ): Promise<Product[]> {
    this.logger.info(
      `Fetching related products for product ID: ${productId}, limit: ${limit}`,
    );

    // First, get the current product to know its subcategory
    const currentProduct = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['subcategory'],
    });

    if (!currentProduct) {
      throw new Error(`Product with ID '${productId}' not found`);
    }

    // Get products from the same subcategory, excluding the current product
    return this.productsRepository.findMany({
      filters: [
        {
          field: 'subcategoryId',
          operator: 'eq',
          value: currentProduct.subcategoryId,
        },
        { field: 'id', operator: 'ne', value: productId }, // Exclude current product
      ],
      relations: ['subcategory', 'questions', 'questions.answers'],
      pagination: { page: 1, limit: limit },
      sort: [
        { field: 'isFeatured', direction: 'DESC' }, // Prioritize featured products
        { field: 'createdAt', direction: 'DESC' },
      ],
    });
  }
}
