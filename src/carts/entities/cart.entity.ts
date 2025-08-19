import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
@Index(['userId'], { unique: true })
export class Cart {
  @ApiProperty({
    description: 'Cart ID',
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
    description: 'Cart creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Cart last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ApiProperty({
    description: 'Cart owner',
    type: () => User,
  })
  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Cart items',
    type: () => [CartItem],
  })
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];

  @ApiProperty({
    description: 'Orders created from this cart',
    type: () => ['Order'],
  })
  @OneToMany('Order', 'cart')
  orders: any[];

  // Virtual fields
  @ApiProperty({
    description: 'Total number of items in cart',
    example: 5,
  })
  get totalItems(): number {
    return this.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  @ApiProperty({
    description: 'Total cart value',
    example: 299.99,
  })
  get totalValue(): number {
    return (
      this.items?.reduce((total, item) => {
        const itemTotal = item.unitPrice * item.quantity;
        const customizationTotal =
          item.customizations?.reduce(
            (custTotal, cust) => custTotal + cust.additionalPrice,
            0,
          ) || 0;
        return total + itemTotal + customizationTotal * item.quantity;
      }, 0) || 0
    );
  }
}
