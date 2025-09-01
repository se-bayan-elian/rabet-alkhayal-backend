import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { Review, ReviewStatus } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsFilterDto } from './dto/get-reviews-filter.dto';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ReviewsService.name);
  }

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<Review> {
    this.logger.info(
      `Creating review for product ${createReviewDto.productId} by user ${userId}`,
    );

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createReviewDto.productId} not found`,
      );
    }

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: { productId: createReviewDto.productId, userId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId,
      status: ReviewStatus.PENDING, // Reviews start as pending for moderation
    });

    return this.reviewRepository.save(review);
  }

  async findByProduct(productId: string): Promise<Review[]> {
    this.logger.info(`Fetching approved reviews for product ${productId}`);

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.reviewRepository.find({
      where: {
        productId,
        status: ReviewStatus.APPROVED,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllForAdmin(
    filters: GetReviewsFilterDto,
  ): Promise<PaginatedResult<Review>> {
    this.logger.info('Fetching all reviews for admin with filters:', filters);

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category');

    // Apply filters
    if (filters.categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.subcategoryId) {
      queryBuilder.andWhere('subcategory.id = :subcategoryId', {
        subcategoryId: filters.subcategoryId,
      });
    }

    if (filters.productId) {
      queryBuilder.andWhere('product.id = :productId', {
        productId: filters.productId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('review.status = :status', {
        status: filters.status,
      });
    }

    if (filters.isFeatured !== undefined) {
      queryBuilder.andWhere('review.isFeatured = :isFeatured', {
        isFeatured: filters.isFeatured,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR review.title ILIKE :search OR review.content ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.orderBy('review.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured(): Promise<Review[]> {
    this.logger.info('Fetching featured reviews');

    return this.reviewRepository.find({
      where: {
        isFeatured: true,
        status: ReviewStatus.APPROVED,
      },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
      take: 10, // Limit to 10 featured reviews
    });
  }

  async findOne(id: string): Promise<Review> {
    this.logger.info(`Fetching review with ID: ${id}`);

    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    this.logger.info(`Updating review with ID: ${id}`);

    const review = await this.findOne(id);

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    this.logger.info(`Deleting review with ID: ${id}`);

    const review = await this.findOne(id);

    await this.reviewRepository.remove(review);
  }

  async toggleFeatured(id: string): Promise<Review> {
    this.logger.info(`Toggling featured status for review ${id}`);

    const review = await this.findOne(id);

    review.isFeatured = !review.isFeatured;
    return this.reviewRepository.save(review);
  }
}
