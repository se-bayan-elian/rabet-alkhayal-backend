import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { QueryOptions } from '../../common/repository/interfaces/query-options.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductOption } from '../entities/product-option.entity';
import { ProductOptionValue } from '../entities/product-option-value.entity';

@Injectable()
export class ProductOptionsRepository extends BaseRepository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductOption)
    private readonly productOptionRepository: Repository<ProductOption>,
    @InjectRepository(ProductOptionValue)
    private readonly productOptionValueRepository: Repository<ProductOptionValue>,
    dataSource: DataSource,
  ) {
    super(productRepository, dataSource);
  }

  /**
   * Create product with its options and values
   */
  async createProductWithOptions(
    productData: CreateProductDto,
  ): Promise<Product> {
    const queryRunner =
      this.productRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the product
      const product = this.productRepository.create({
        name: productData.name,
        originalPrice: productData.originalPrice,
        discountedPrice: productData.discountedPrice,
        weight: productData.weight,
        subcategoryId: productData.subcategoryId,
        imageUrl: productData.imageUrl,
        imagePublicId: productData.imagePublicId,
        isFeatured: productData.isFeatured || false,
      });

      const savedProduct = await queryRunner.manager.save(Product, product);

      // Create product questions and their answers
      if (productData.questions && productData.questions.length > 0) {
        for (const questionData of productData.questions) {
          const question = this.productOptionRepository.create({
            productId: savedProduct.id,
            questionText: questionData.questionText,
            type: questionData.type,
            required: questionData.required,
          });

          const savedQuestion = await queryRunner.manager.save(
            ProductOption,
            question,
          );

          // Create question answers
          if (questionData.answers && questionData.answers.length > 0) {
            for (const answerData of questionData.answers) {
              const answer = this.productOptionValueRepository.create({
                optionId: savedQuestion.id,
                answerText: answerData.answerText,
                imageUrl: answerData.imageUrl,
                imagePublicId: answerData.imagePublicId,
                extraPrice: answerData.extraPrice || 0,
              });

              await queryRunner.manager.save(ProductOptionValue, answer);
            }
          }
        }
      }

      await queryRunner.commitTransaction();

      // Return product with relations
      return this.findOne({
        where: { id: savedProduct.id },
        relations: ['subcategory', 'questions', 'questions.answers'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find products by subcategory
   */
  async findBySubcategory(
    subcategoryId: string,
    queryOptions?: QueryOptions<Product>,
  ) {
    const options: QueryOptions<Product> = {
      ...queryOptions,
      filters: [
        ...(queryOptions?.filters || []),
        { field: 'subcategoryId', operator: 'eq', value: subcategoryId },
      ],
      relations: ['subcategory', 'questions', 'questions.answers'],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Search products by name
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
      relations: ['subcategory', 'questions', 'questions.answers'],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Find products with price range
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
      relations: ['subcategory', 'questions', 'questions.answers'],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Update product with options
   */
  async updateProductWithOptions(
    id: string,
    updateData: Partial<CreateProductDto>,
  ): Promise<Product> {
    const queryRunner =
      this.productRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update product basic info
      if (
        updateData.name ||
        updateData.originalPrice ||
        updateData.discountedPrice ||
        updateData.weight
      ) {
        await queryRunner.manager.update(Product, id, {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.originalPrice && {
            originalPrice: updateData.originalPrice,
          }),
          ...(updateData.discountedPrice && {
            discountedPrice: updateData.discountedPrice,
          }),
          ...(updateData.weight && { weight: updateData.weight }),
          ...(updateData.subcategoryId && {
            subcategoryId: updateData.subcategoryId,
          }),
        });
      }

      // Handle questions update if provided
      if (updateData.questions) {
        // Remove existing questions and answers
        await queryRunner.manager.delete(ProductOption, { productId: id });

        // Create new questions
        for (const questionData of updateData.questions) {
          const question = this.productOptionRepository.create({
            productId: id,
            questionText: questionData.questionText,
            type: questionData.type,
            required: questionData.required,
          });

          const savedQuestion = await queryRunner.manager.save(
            ProductOption,
            question,
          );

          // Create question answers
          if (questionData.answers && questionData.answers.length > 0) {
            for (const answerData of questionData.answers) {
              const answer = this.productOptionValueRepository.create({
                optionId: savedQuestion.id,
                answerText: answerData.answerText,
                imageUrl: answerData.imageUrl,
                imagePublicId: answerData.imagePublicId,
                extraPrice: answerData.extraPrice || 0,
              });

              await queryRunner.manager.save(ProductOptionValue, answer);
            }
          }
        }
      }

      await queryRunner.commitTransaction();

      // Return updated product with relations
      return this.findOne({
        where: { id },
        relations: ['subcategory', 'questions', 'questions.answers'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
