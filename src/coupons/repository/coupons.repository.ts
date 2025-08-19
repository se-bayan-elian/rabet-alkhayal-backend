import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repository/base.repository';
import { Coupon } from '../entities/coupon.entity';
import { CouponUsage } from '../entities/coupon-usage.entity';
import { ICouponsRepository } from './coupons-repository.interface';
import { DiscountType } from '../../common/enums';

@Injectable()
export class CouponsRepository
  extends BaseRepository<Coupon>
  implements ICouponsRepository
{
  constructor(
    @InjectRepository(Coupon)
    repository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private couponUsageRepository: Repository<CouponUsage>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.repository.findOne({
      where: { code: code.toUpperCase() },
    });
  }

  async validateCoupon(
    code: string,
    userId: string,
    orderTotal: number,
  ): Promise<{
    isValid: boolean;
    coupon?: Coupon;
    discountAmount?: number;
    error?: string;
  }> {
    const coupon = await this.findByCode(code.toUpperCase());

    if (!coupon) {
      return { isValid: false, error: 'Coupon not found' };
    }

    if (!coupon.isValid) {
      if (!coupon.isActive) {
        return { isValid: false, error: 'Coupon is inactive' };
      }
      if (coupon.isExpired) {
        return { isValid: false, error: 'Coupon has expired' };
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { isValid: false, error: 'Coupon usage limit reached' };
      }
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount && orderTotal < coupon.minimumOrderAmount) {
      return {
        isValid: false,
        error: `Minimum order amount of ${coupon.minimumOrderAmount} required`,
      };
    }

    // Check user-specific usage limit
    if (coupon.usageLimitPerUser) {
      const userUsageCount = await this.getUserUsageCount(coupon.id, userId);
      if (userUsageCount >= coupon.usageLimitPerUser) {
        return {
          isValid: false,
          error: 'User usage limit reached for this coupon',
        };
      }
    }

    const discountAmount = coupon.calculateDiscount(orderTotal);

    return {
      isValid: true,
      coupon,
      discountAmount,
    };
  }

  async useCoupon(
    couponId: string,
    userId: string,
    orderId: string,
    orderTotal: number,
    discountAmount: number,
  ): Promise<CouponUsage> {
    return this.dataSource.transaction(async (manager) => {
      // Increment coupon usage count
      await manager
        .getRepository(Coupon)
        .increment({ id: couponId }, 'usedCount', 1);

      // Record usage
      const usage = manager.getRepository(CouponUsage).create({
        couponId,
        userId,
        orderId,
        orderTotal,
        discountAmount,
      });

      return manager.getRepository(CouponUsage).save(usage);
    });
  }

  async getUserUsageCount(couponId: string, userId: string): Promise<number> {
    return this.couponUsageRepository.count({
      where: { couponId, userId },
    });
  }

  async findActiveCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return this.repository
      .createQueryBuilder('coupon')
      .where('coupon.isActive = :isActive', { isActive: true })
      .andWhere('coupon.startDate <= :now', { now })
      .andWhere('coupon.expiryDate > :now', { now })
      .andWhere(
        '(coupon.usageLimit IS NULL OR coupon.usedCount < coupon.usageLimit)',
      )
      .orderBy('coupon.createdAt', 'DESC')
      .getMany();
  }

  async findExpiredCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return this.repository
      .createQueryBuilder('coupon')
      .where('coupon.expiryDate <= :now', { now })
      .orderBy('coupon.expiryDate', 'DESC')
      .getMany();
  }

  async findExpiringCoupons(days: number): Promise<Coupon[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.repository
      .createQueryBuilder('coupon')
      .where('coupon.isActive = :isActive', { isActive: true })
      .andWhere('coupon.expiryDate > :now', { now })
      .andWhere('coupon.expiryDate <= :futureDate', { futureDate })
      .orderBy('coupon.expiryDate', 'ASC')
      .getMany();
  }

  async getCouponStats(couponId: string): Promise<{
    totalUsage: number;
    totalDiscountGiven: number;
    uniqueUsers: number;
    averageOrderValue: number;
  }> {
    const usages = await this.couponUsageRepository.find({
      where: { couponId },
    });

    const totalUsage = usages.length;
    const totalDiscountGiven = usages.reduce(
      (sum, usage) => sum + Number(usage.discountAmount),
      0,
    );
    const uniqueUsers = new Set(usages.map((usage) => usage.userId)).size;
    const totalOrderValue = usages.reduce(
      (sum, usage) => sum + Number(usage.orderTotal),
      0,
    );
    const averageOrderValue = totalUsage > 0 ? totalOrderValue / totalUsage : 0;

    return {
      totalUsage,
      totalDiscountGiven,
      uniqueUsers,
      averageOrderValue,
    };
  }

  async getUserCouponHistory(userId: string): Promise<CouponUsage[]> {
    return this.couponUsageRepository.find({
      where: { userId },
      relations: ['coupon'],
      order: { usedAt: 'DESC' },
    });
  }

  async incrementUsageCount(couponId: string): Promise<void> {
    await this.repository.increment({ id: couponId }, 'usedCount', 1);
  }

  async deactivateCoupon(couponId: string): Promise<Coupon> {
    const coupon = await this.findByIdOrThrow(couponId);
    coupon.isActive = false;
    return this.repository.save(coupon);
  }

  async findByDiscountType(discountType: string): Promise<Coupon[]> {
    return this.repository.find({
      where: { discountType: discountType as DiscountType },
      order: { createdAt: 'DESC' },
    });
  }
}
