import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductOption } from './product-option.entity';

@Entity('product_option_values')
export class ProductOptionValue {
  @ApiProperty({
    description: 'Product option value ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Option ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'option_id' })
  optionId: string;

  @ApiProperty({
    description: 'Option value',
    example: 'Large',
  })
  @Column({ type: 'varchar' })
  value: string;

  @ApiProperty({
    description: 'Extra price for this option value',
    example: 10.0,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    name: 'extra_price',
  })
  extraPrice: number;

  @ApiProperty({
    description: 'Product option this value belongs to',
    type: () => ProductOption,
  })
  @ManyToOne(() => ProductOption, (option) => option.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_id' })
  option: ProductOption;
}
