import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PricingPlan } from './pricing-plan.entity';

@Entity('features')
export class Feature {
  @ApiProperty({
    description: 'Feature ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Pricing plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'pricing_plan_id' })
  pricingPlanId: string;

  @ApiProperty({
    description: 'Feature name',
    example: 'Responsive Design',
  })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({
    description: 'Feature description',
    example: 'Mobile-friendly responsive web design',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Feature icon (CSS class or emoji)',
    example: '✓',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  @ApiProperty({
    description: 'Whether the feature is included',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_included', default: true })
  isIncluded: boolean;

  @ApiProperty({
    description: 'Feature quantity or limit',
    example: 5,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  quantity?: string;

  @ApiProperty({
    description: 'Feature display order',
    example: 1,
  })
  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder: number;

  @ApiProperty({
    description: 'Feature creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Feature last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ApiProperty({
    description: 'Pricing plan this feature belongs to',
    type: () => PricingPlan,
  })
  @ManyToOne(() => PricingPlan, (pricingPlan) => pricingPlan.features)
  @JoinColumn({ name: 'pricing_plan_id' })
  pricingPlan: PricingPlan;

  // Virtual fields
  @ApiProperty({
    description: 'Feature display text with quantity',
    example: 'Responsive Design (Up to 5 pages)',
  })
  get displayText(): string {
    let text = this.name;
    if (this.quantity) {
      text += ` (${this.quantity})`;
    }
    return text;
  }

  @ApiProperty({
    description: 'Feature status indicator',
    example: 'included',
  })
  get status(): string {
    return this.isIncluded ? 'included' : 'not-included';
  }
}
