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
    description: 'Answer text/value',
    example: 'Large',
  })
  @Column({ type: 'varchar', name: 'answer_text' })
  answerText: string;

  @ApiProperty({
    description: 'Answer image URL (for IMAGE type questions)',
    example: 'https://cdn.example.com/answer-image.jpg',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true, name: 'image_url' })
  imageUrl?: string;

  @ApiProperty({
    description: 'Answer image Cloudinary public ID',
    example: 'answers/images/answer-123',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true, name: 'image_public_id' })
  imagePublicId?: string;

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
    description: 'Question this answer belongs to',
    type: () => ProductOption,
  })
  @ManyToOne(() => ProductOption, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_id' })
  question: ProductOption;
}
