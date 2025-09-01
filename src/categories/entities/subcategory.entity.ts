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
import { Category } from './category.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('subcategories')
export class Subcategory {
  @ApiProperty({
    description: 'Subcategory ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Subcategory name',
    example: 'Smartphones',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Subcategory description',
    example: 'Mobile phones and smartphones',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Subcategory image URL',
    example: 'https://cdn.example.com/subcategory.jpg',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @ApiProperty({
    description: 'Subcategory image Cloudinary public ID',
    example: 'subcategories/image/123',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  imagePublicId?: string;

  @ApiProperty({
    description: 'Subcategory icon URL',
    example: 'https://cdn.example.com/icon.png',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  iconUrl?: string;

  @ApiProperty({
    description: 'Subcategory icon Cloudinary public ID',
    example: 'subcategories/icon/123',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  iconPublicId?: string;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'category_id' })
  categoryId: string;

  @ApiProperty({
    description: 'Parent category',
    type: () => Category,
  })
  @ManyToOne(() => Category, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({
    description: 'Products in this subcategory',
    type: () => [Product],
  })
  @OneToMany(() => Product, (product) => product.subcategory, { cascade: true })
  products: Product[];

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
