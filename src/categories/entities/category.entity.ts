import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Subcategory } from './subcategory.entity';

@Entity('categories')
export class Category {
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    description: 'Category subcategories',
    type: () => [Subcategory],
  })
  @OneToMany(() => Subcategory, (subcategory) => subcategory.category, {
    cascade: true,
  })
  subcategories: Subcategory[];

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
