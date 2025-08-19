import { IBaseRepository } from '../../common/repository/interfaces/base-repository.interface';
import { Coupon } from '../entities/coupon.entity';
import { CouponUsage } from '../entities/coupon-usage.entity';

export interface ICouponsRepository extends IBaseRepository<Coupon> {
  /**
   * Find coupon by code
   */
  findByCode(code: string): Promise<Coupon | null>;

  /**
   * Validate coupon for user and order
   */
  validateCoupon(
    code: string,
    userId: string,
    orderTotal: number,
  ): Promise<{
    isValid: boolean;
    coupon?: Coupon;
    discountAmount?: number;
    error?: string;
  }>;

  /**
   * Use coupon and record usage
   */
  useCoupon(
    couponId: string,
    userId: string,
    orderId: string,
    orderTotal: number,
    discountAmount: number,
  ): Promise<CouponUsage>;

  /**
   * Get user coupon usage count for specific coupon
   */
  getUserUsageCount(couponId: string, userId: string): Promise<number>;

  /**
   * Get active coupons
   */
  findActiveCoupons(): Promise<Coupon[]>;

  /**
   * Get expired coupons
   */
  findExpiredCoupons(): Promise<Coupon[]>;

  /**
   * Get coupons expiring soon
   */
  findExpiringCoupons(days: number): Promise<Coupon[]>;

  /**
   * Get coupon statistics
   */
  getCouponStats(couponId: string): Promise<{
    totalUsage: number;
    totalDiscountGiven: number;
    uniqueUsers: number;
    averageOrderValue: number;
  }>;

  /**
   * Get user coupon usage history
   */
  getUserCouponHistory(userId: string): Promise<CouponUsage[]>;

  /**
   * Increment coupon usage count
   */
  incrementUsageCount(couponId: string): Promise<void>;

  /**
   * Deactivate coupon
   */
  deactivateCoupon(couponId: string): Promise<Coupon>;

  /**
   * Find coupons by discount type
   */
  findByDiscountType(discountType: string): Promise<Coupon[]>;
}
