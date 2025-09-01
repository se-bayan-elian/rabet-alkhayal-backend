import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('reviews')
export class Review {
  @ApiProperty({
    description: 'Review ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Review rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'int' })
  rating: number;

  @ApiProperty({
    description: 'Review title',
    example: 'Great product!',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Review content',
    example: 'This product exceeded my expectations. Highly recommend!',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: 'Review status',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED,
  })
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @ApiProperty({
    description: 'Is this review featured',
    example: false,
  })
  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'product_id' })
  productId: string;

  @ApiProperty({
    description: 'Product being reviewed',
    type: () => Product,
  })
  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'User who wrote the review',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
