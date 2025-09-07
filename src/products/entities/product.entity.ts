import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Subcategory } from '../../categories/entities/subcategory.entity';
import { ProductOption } from './product-option.entity';
import { CartItem } from '../../carts/entities/cart-item.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('products')
export class Product {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced camera system and A17 Pro chip',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Original price',
    example: 999.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'original_price' })
  originalPrice: number;

  @ApiProperty({
    description: 'Discounted price',
    example: 899.99,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'discounted_price',
  })
  discountedPrice: number;

  @ApiProperty({
    description: 'Product weight in kg',
    example: 0.5,
  })
  @Column({ type: 'decimal', precision: 8, scale: 3 })
  weight: number;

  @ApiProperty({
    description: 'Is this product featured',
    example: false,
  })
  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://cdn.example.com/product-image.jpg',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true, name: 'image_url' })
  imageUrl?: string;

  @ApiProperty({
    description: 'Product image Cloudinary public ID',
    example: 'products/images/product-123',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true, name: 'image_public_id' })
  imagePublicId?: string;

  @ApiProperty({
    description: 'Subcategory ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'subcategory_id' })
  subcategoryId: string;

  @ApiProperty({
    description: 'Product subcategory',
    type: () => Subcategory,
  })
  @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @ApiProperty({
    description: 'Product questions (customizations)',
    type: () => [ProductOption],
  })
  @OneToMany(() => ProductOption, (question) => question.product, {
    cascade: true,
  })
  questions: ProductOption[];

  @ApiProperty({
    description: 'Cart items containing this product',
    type: () => [CartItem],
  })
  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @ApiProperty({
    description: 'Product reviews',
    type: () => [Review],
  })
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @ApiProperty({
    description: 'Average review rating',
    example: 4.5,
    required: false,
  })
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    name: 'average_rating',
  })
  averageRating?: number;

  @ApiProperty({
    description: 'Total number of reviews',
    example: 25,
  })
  @Column({ type: 'int', default: 0, name: 'review_count' })
  reviewCount: number;

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
