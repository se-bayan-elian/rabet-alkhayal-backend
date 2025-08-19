import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';
import { CartCustomization } from './cart-customization.entity';

@Entity('cart_items')
export class CartItem {
  @ApiProperty({
    description: 'Cart item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Cart ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({
    description: 'Unit price at the time of adding to cart',
    example: 99.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  // Relations
  @ApiProperty({
    description: 'Cart this item belongs to',
    type: () => Cart,
  })
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ApiProperty({
    description: 'Product details',
    type: () => Product,
  })
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({
    description: 'Product customizations',
    type: () => [CartCustomization],
  })
  @OneToMany(() => CartCustomization, (customization) => customization.cartItem)
  customizations: CartCustomization[];

  // Virtual fields
  @ApiProperty({
    description: 'Total price for this cart item including customizations',
    example: 219.98,
  })
  get totalPrice(): number {
    const basePrice = this.unitPrice * this.quantity;
    const customizationPrice =
      this.customizations?.reduce(
        (total, cust) => total + cust.additionalPrice * this.quantity,
        0,
      ) || 0;
    return basePrice + customizationPrice;
  }
}
