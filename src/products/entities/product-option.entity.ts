import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OptionType } from '../../common/helpers/enums';
import { Product } from './product.entity';
import { ProductOptionValue } from './product-option-value.entity';
import { CartCustomization } from '../../carts/entities/cart-customization.entity';

@Entity('product_options')
export class ProductOption {
  @ApiProperty({
    description: 'Product option ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'product_id' })
  productId: string;

  @ApiProperty({
    description: 'Option name',
    example: 'Size',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Option type',
    enum: OptionType,
    example: OptionType.SELECT,
  })
  @Column({ type: 'enum', enum: OptionType })
  type: OptionType;

  @ApiProperty({
    description: 'Whether this option is required',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  required: boolean;

  @ApiProperty({
    description: 'Product this option belongs to',
    type: () => Product,
  })
  @ManyToOne(() => Product, (product) => product.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({
    description: 'Available values for this option',
    type: () => [ProductOptionValue],
  })
  @OneToMany(() => ProductOptionValue, (value) => value.option, {
    cascade: true,
  })
  values: ProductOptionValue[];

  @ApiProperty({
    description: 'Cart customizations using this option',
    type: () => [CartCustomization],
  })
  @OneToMany(() => CartCustomization, (customization) => customization.option)
  cartCustomizations: CartCustomization[];
}
