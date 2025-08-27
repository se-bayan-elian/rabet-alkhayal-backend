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
import { Service } from './service.entity';
import { Feature } from './feature.entity';

@Entity('pricing_plans')
export class PricingPlan {
  @ApiProperty({
    description: 'Pricing plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'service_id' })
  serviceId: string;

  @ApiProperty({
    description: 'Plan name',
    example: 'Basic Plan',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Perfect for small businesses getting started',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Original price before any discounts',
    example: 399.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'original_price' })
  originalPrice: number;

  @ApiProperty({
    description: 'Final price after discounts',
    example: 299.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'final_price' })
  finalPrice: number;

  @ApiProperty({
    description: 'Billing period (monthly, yearly, one-time)',
    example: 'monthly',
  })
  @Column({ type: 'varchar', length: 20, default: 'one-time' })
  billingPeriod: string;

  @ApiProperty({
    description: 'Delivery time in days',
    example: 30,
  })
  @Column({ type: 'int', nullable: true })
  deliveryDays?: number;

  @ApiProperty({
    description: 'Number of revisions included',
    example: 3,
  })
  @Column({ type: 'int', nullable: true })
  revisions?: number;

  @ApiProperty({
    description: 'Whether the plan is popular',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isPopular: boolean;

  @ManyToOne(() => Service, (service) => service.pricingPlans)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @OneToMany(() => Feature, (feature) => feature.pricingPlan, {
    cascade: true,
    eager: true,
  })
  features: Feature[];

  @ApiProperty({
    description: 'Whether the plan is active',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Plan display order',
    example: 1,
  })
  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder: number;

  @ApiProperty({
    description: 'Plan creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Plan last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  @ApiProperty({
    description: 'Formatted price with currency',
    example: '$299.99',
  })
  @ApiProperty({
    description: 'Delivery timeframe description',
    example: '30 days delivery',
  })
  get deliveryTimeframe(): string {
    if (!this.deliveryDays) return 'Contact for timeline';
    return `${this.deliveryDays} days delivery`;
  }

  @ApiProperty({
    description: 'Number of features in this plan',
    example: 8,
  })
  get featureCount(): number {
    return this.features?.length || 0;
  }
}
