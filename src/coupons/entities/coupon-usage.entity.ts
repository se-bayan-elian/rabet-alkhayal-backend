import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Coupon } from './coupon.entity';

@Entity('coupon_usages')
export class CouponUsage {
  @ApiProperty({
    description: 'Coupon usage ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'Coupon ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'coupon_id' })
  couponId: string;

  @ApiProperty({
    description: 'Order ID (if used in an order)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'order_id', nullable: true })
  orderId?: string;

  @ApiProperty({
    description: 'Discount amount applied',
    example: 50.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_amount' })
  discountAmount: number;

  @ApiProperty({
    description: 'Order total when coupon was applied',
    example: 299.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'order_total' })
  orderTotal: number;

  @ApiProperty({
    description: 'Usage creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'used_at' })
  usedAt: Date;

  // Relations
  @ApiProperty({
    description: 'User who used the coupon',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Coupon that was used',
    type: () => Coupon,
  })
  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;
}
