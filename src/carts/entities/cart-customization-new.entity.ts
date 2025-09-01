import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductOption } from '../../products/entities/product-option.entity';
import { CartItem } from './cart-item.entity';

@Entity('cart_customizations')
export class CartCustomization {
  @ApiProperty({
    description: 'Cart customization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Cart item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'cart_item_id' })
  cartItemId: string;

  @ApiProperty({
    description: 'Question ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'option_id' })
  optionId: string;

  @ApiProperty({
    description: 'Question text',
    example: 'What size would you like?',
  })
  @Column({ type: 'varchar', name: 'question_text' })
  questionText: string;

  @ApiProperty({
    description: 'Selected answer (for predefined questions)',
    example: 'Large',
    required: false,
  })
  @Column({ type: 'varchar', name: 'selected_answer', nullable: true })
  selectedAnswer?: string;

  @ApiProperty({
    description: 'Selected answer image URL',
    example: 'https://cdn.example.com/answer-image.jpg',
    required: false,
  })
  @Column({
    type: 'varchar',
    name: 'selected_answer_image_url',
    nullable: true,
  })
  selectedAnswerImageUrl?: string;

  @ApiProperty({
    description: 'Selected answer image public ID',
    example: 'answers/images/answer-123',
    required: false,
  })
  @Column({
    type: 'varchar',
    name: 'selected_answer_image_public_id',
    nullable: true,
  })
  selectedAnswerImagePublicId?: string;

  @ApiProperty({
    description: 'Customer input for text fields',
    example: 'John Doe',
    required: false,
  })
  @Column({ type: 'text', name: 'customer_input', nullable: true })
  customerInput?: string;

  @ApiProperty({
    description: 'Additional price for this customization',
    example: 5.99,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    name: 'additional_price',
  })
  additionalPrice: number;

  @ApiProperty({
    description: 'Question this customization belongs to',
    type: () => ProductOption,
  })
  @ManyToOne(() => ProductOption, (question) => question.cartCustomizations)
  @JoinColumn({ name: 'option_id' })
  question: ProductOption;

  @ApiProperty({
    description: 'Cart item this customization belongs to',
    type: () => CartItem,
  })
  @ManyToOne(() => CartItem, (cartItem) => cartItem.customizations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_item_id' })
  cartItem: CartItem;

  get displayValue(): string {
    return this.selectedAnswer || this.customerInput || '';
  }

  get displayImageUrl(): string | null {
    return this.selectedAnswerImageUrl || null;
  }

  get displayImagePublicId(): string | null {
    return this.selectedAnswerImagePublicId || null;
  }
}
