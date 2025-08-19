import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from './cart-item.entity';
import { ProductOption } from '../../products/entities/product-option.entity';

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
  @Column({ type: 'uuid', name: 'cart_item_id' })
  cartItemId: string;

  @ApiProperty({
    description: 'Product option ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'option_id' })
  optionId: string;

  @ApiProperty({
    description: 'Option name',
    example: 'Size',
  })
  @Column({ type: 'varchar', name: 'option_name' })
  optionName: string;

  @ApiProperty({
    description: 'Selected value (for predefined options)',
    example: 'XL',
    required: false,
  })
  @Column({ type: 'varchar', name: 'selected_value', nullable: true })
  selectedValue?: string;

  @ApiProperty({
    description: 'Customer input (for text inputs)',
    example: 'John Doe',
    required: false,
  })
  @Column({ type: 'varchar', name: 'customer_input', nullable: true })
  customerInput?: string;

  @ApiProperty({
    description: 'Additional price for this customization',
    example: 10.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'additional_price',
    default: 0.0,
  })
  additionalPrice: number;

  // Relations
  @ApiProperty({
    description: 'Cart item this customization belongs to',
    type: () => CartItem,
  })
  @ManyToOne(() => CartItem, (cartItem) => cartItem.customizations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_item_id' })
  cartItem: CartItem;

  @ApiProperty({
    description: 'Product option this customization is for',
    type: () => ProductOption,
  })
  @ManyToOne(() => ProductOption, (option) => option.cartCustomizations)
  @JoinColumn({ name: 'option_id' })
  option: ProductOption;

  // Virtual fields
  @ApiProperty({
    description: 'Display value for the customization',
    example: 'XL',
  })
  get displayValue(): string {
    return this.selectedValue || this.customerInput || '';
  }
}
