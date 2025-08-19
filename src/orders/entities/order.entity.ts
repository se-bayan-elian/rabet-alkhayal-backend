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
import { Cart } from '../../carts/entities/cart.entity';
import { PaymentMethod, PaymentStatus, OrderStatus } from '../../common/enums';

@Entity('orders')
export class Order {
  @ApiProperty({
    description: 'Order ID',
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
    description: 'Cart ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.MOYASAR,
  })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    name: 'payment_status',
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    name: 'order_status',
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @ApiProperty({
    description: 'Google address for delivery',
    example: '123 Main St, City, Country',
  })
  @Column({ type: 'text', name: 'google_address' })
  googleAddress: string;

  @ApiProperty({
    description: 'Whether delivery is enabled for this order',
    example: true,
  })
  @Column({ type: 'boolean', name: 'delivery_enabled', default: false })
  deliveryEnabled: boolean;

  @ApiProperty({
    description: 'Delivery fee',
    example: 15.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'delivery_fee',
    default: 0.0,
  })
  deliveryFee: number;

  @ApiProperty({
    description: 'Tax amount',
    example: 29.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  tax: number;

  @ApiProperty({
    description: 'Coupon ID (if applied)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @Column({ type: 'uuid', name: 'coupon_id', nullable: true })
  couponId?: string;

  @ApiProperty({
    description: 'Discount amount applied',
    example: 50.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'discount_amount',
    default: 0.0,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Total order amount',
    example: 299.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ApiProperty({
    description: 'Order creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ApiProperty({
    description: 'Order owner',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Cart details for this order',
    type: () => Cart,
  })
  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  // Virtual fields
  @ApiProperty({
    description: 'Subtotal before tax and delivery',
    example: 254.99,
  })
  get subtotal(): number {
    return this.total - this.tax - this.deliveryFee + this.discountAmount;
  }

  @ApiProperty({
    description: 'Whether the order can be cancelled',
    example: true,
  })
  get canBeCancelled(): boolean {
    return (
      this.orderStatus === OrderStatus.PENDING &&
      this.paymentStatus !== PaymentStatus.PAID
    );
  }
}
