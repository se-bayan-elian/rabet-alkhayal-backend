import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '../../common/enums';

@Entity('coupons')
export class Coupon {
  @ApiProperty({
    description: 'Coupon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Coupon code',
    example: 'SAVE20',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({
    description: 'Coupon description',
    example: 'Save 20% on your order',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Discount type',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @Column({
    type: 'enum',
    enum: DiscountType,
    name: 'discount_type',
  })
  discountType: DiscountType;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount)',
    example: 20,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_value' })
  discountValue: number;

  @ApiProperty({
    description: 'Minimum order amount to apply coupon',
    example: 100.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'minimum_order_amount',
    nullable: true,
  })
  minimumOrderAmount?: number;

  @ApiProperty({
    description: 'Maximum discount amount (for percentage discounts)',
    example: 50.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'maximum_discount_amount',
    nullable: true,
  })
  maximumDiscountAmount?: number;

  @ApiProperty({
    description: 'Usage limit (total number of times coupon can be used)',
    example: 100,
  })
  @Column({ type: 'int', name: 'usage_limit', nullable: true })
  usageLimit?: number;

  @ApiProperty({
    description: 'Number of times coupon has been used',
    example: 25,
  })
  @Column({ type: 'int', name: 'used_count', default: 0 })
  usedCount: number;

  @ApiProperty({
    description: 'Usage limit per user',
    example: 1,
  })
  @Column({ type: 'int', name: 'usage_limit_per_user', nullable: true })
  usageLimitPerUser?: number;

  @ApiProperty({
    description: 'Whether the coupon is active',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Coupon start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ type: 'timestamp', name: 'start_date' })
  startDate: Date;

  @ApiProperty({
    description: 'Coupon expiry date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @Column({ type: 'timestamp', name: 'expiry_date' })
  expiryDate: Date;

  @ApiProperty({
    description: 'Coupon creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Coupon last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  @ApiProperty({
    description: 'Whether the coupon is expired',
    example: false,
  })
  get isExpired(): boolean {
    return new Date() > this.expiryDate;
  }

  @ApiProperty({
    description: 'Whether the coupon is valid (active and not expired)',
    example: true,
  })
  get isValid(): boolean {
    const now = new Date();
    return (
      this.isActive &&
      now >= this.startDate &&
      now <= this.expiryDate &&
      (this.usageLimit === null || this.usedCount < this.usageLimit)
    );
  }

  @ApiProperty({
    description: 'Remaining usage count',
    example: 75,
  })
  get remainingUsage(): number | null {
    if (this.usageLimit === null) return null;
    return Math.max(0, this.usageLimit - this.usedCount);
  }

  /**
   * Calculate discount amount for a given order total
   */
  calculateDiscount(orderTotal: number): number {
    if (!this.isValid) return 0;

    if (this.minimumOrderAmount && orderTotal < this.minimumOrderAmount) {
      return 0;
    }

    let discount = 0;

    if (this.discountType === DiscountType.PERCENTAGE) {
      discount = (orderTotal * this.discountValue) / 100;

      // Apply maximum discount limit for percentage discounts
      if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
        discount = this.maximumDiscountAmount;
      }
    } else if (this.discountType === DiscountType.FIXED) {
      discount = this.discountValue;
    }

    // Ensure discount doesn't exceed order total
    return Math.min(discount, orderTotal);
  }
}
