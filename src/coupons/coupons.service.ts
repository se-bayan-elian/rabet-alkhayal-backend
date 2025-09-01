import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';

interface FindAllFilters {
  isActive?: boolean;
  isValid?: boolean;
  search?: string;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(CouponsService.name);
  }

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    this.logger.info(`Creating coupon: ${createCouponDto.code}`);

    // Check if coupon code already exists
    const existingCoupon = await this.couponRepository.findOne({
      where: { code: createCouponDto.code },
    });

    if (existingCoupon) {
      throw new BadRequestException(
        `Coupon with code ${createCouponDto.code} already exists`,
      );
    }

    // Validate dates
    const startDate = new Date(createCouponDto.startDate);
    const expiryDate = new Date(createCouponDto.expiryDate);

    if (expiryDate <= startDate) {
      throw new BadRequestException('Expiry date must be after start date');
    }

    // Validate percentage discount
    if (
      createCouponDto.discountType === 'percentage' &&
      createCouponDto.discountValue > 100
    ) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const coupon = this.couponRepository.create({
      ...createCouponDto,
      startDate,
      expiryDate,
    });

    return this.couponRepository.save(coupon);
  }

  async findAll(filters: FindAllFilters = {}): Promise<Coupon[]> {
    this.logger.info('Fetching all coupons with filters:', filters);

    const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('coupon.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(coupon.code ILIKE :search OR coupon.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // For isValid filter, we need to check multiple conditions
    if (filters.isValid !== undefined) {
      const now = new Date();
      if (filters.isValid) {
        // Valid coupons: active, within date range (inclusive), and usage limit not exceeded
        queryBuilder
          .andWhere('coupon.isActive = true')
          .andWhere('coupon.startDate <= :startNow', { startNow: now })
          .andWhere('coupon.expiryDate >= :expiryNow', { expiryNow: now })
          .andWhere(
            '(coupon.usageLimit IS NULL OR coupon.usedCount < coupon.usageLimit)',
          );
      } else {
        // Invalid coupons: NOT (active AND within date range AND usage limit not exceeded)
        queryBuilder.andWhere(
          'NOT (coupon.isActive = true AND coupon.startDate <= :invalidStartNow AND coupon.expiryDate >= :invalidExpiryNow AND (coupon.usageLimit IS NULL OR coupon.usedCount < coupon.usageLimit))',
          { invalidStartNow: now, invalidExpiryNow: now },
        );
      }
    }
    queryBuilder.orderBy('coupon.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Coupon> {
    this.logger.info(`Fetching coupon with ID: ${id}`);

    const coupon = await this.couponRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    this.logger.info(`Fetching coupon with code: ${code}`);

    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    this.logger.info(`Updating coupon with ID: ${id}`);

    const coupon = await this.findOne(id);

    // Check if code is being updated and already exists
    if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
      const existingCoupon = await this.couponRepository.findOne({
        where: { code: updateCouponDto.code },
      });

      if (existingCoupon) {
        throw new BadRequestException(
          `Coupon with code ${updateCouponDto.code} already exists`,
        );
      }
    }

    // Validate dates if provided
    if (updateCouponDto.startDate || updateCouponDto.expiryDate) {
      const startDate = updateCouponDto.startDate
        ? new Date(updateCouponDto.startDate)
        : coupon.startDate;
      const expiryDate = updateCouponDto.expiryDate
        ? new Date(updateCouponDto.expiryDate)
        : coupon.expiryDate;

      if (expiryDate <= startDate) {
        throw new BadRequestException('Expiry date must be after start date');
      }
    }

    // Validate percentage discount
    if (
      updateCouponDto.discountType === 'percentage' &&
      updateCouponDto.discountValue > 100
    ) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Convert date strings to Date objects
    const updateData = { ...updateCouponDto };
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate) as any;
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate) as any;
    }

    Object.assign(coupon, updateData);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    this.logger.info(`Deleting coupon with ID: ${id}`);

    const result = await this.couponRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
  }

  async getCouponStats(id: string) {
    this.logger.info(`Fetching coupon statistics for ID: ${id}`);

    const coupon = await this.findOne(id);

    // You can extend this to get more detailed stats from order history
    const stats = {
      totalUsage: coupon.usedCount,
      remainingUsage: coupon.remainingUsage,
      usageRate: coupon.usageLimit
        ? (coupon.usedCount / coupon.usageLimit) * 100
        : null,
      isValid: coupon.isValid,
      isExpired: coupon.isExpired,
      daysUntilExpiry: Math.ceil(
        (coupon.expiryDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    };

    return stats;
  }

  // Method for applying coupon (used by orders service)
  async applyCoupon(
    code: string,
    orderTotal: number,
    userId?: string,
  ): Promise<{ coupon: Coupon; discount: number }> {
    this.logger.info(
      `Applying coupon ${code} to order total ${orderTotal}${userId ? ` for user ${userId}` : ''}`,
    );

    const coupon = await this.findByCode(code);

    if (!coupon.isValid) {
      throw new BadRequestException('Coupon is not valid or has expired');
    }

    // Check usage limit per user if specified
    if (userId && coupon.usageLimitPerUser) {
      // TODO: Implement user-specific usage tracking
      // This would require a separate table to track per-user coupon usage
      this.logger.warn(
        `Per-user limit check not implemented yet for user ${userId}`,
      );
    }

    const discount = coupon.calculateDiscount(orderTotal);

    if (discount === 0) {
      throw new BadRequestException(
        'Order does not meet minimum requirements for this coupon',
      );
    }

    return { coupon, discount };
  }

  // Method to increment usage count (called after successful order)
  async incrementUsage(couponId: string): Promise<void> {
    await this.couponRepository.increment({ id: couponId }, 'usedCount', 1);
  }
}
