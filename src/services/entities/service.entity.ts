import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { PricingPlan } from './pricing-plan.entity';

@Entity('services')
export class Service {
  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Service name in English',
    example: 'Web Development',
  })
  @Column({ type: 'varchar', length: 100 })
  nameEn: string;

  @ApiProperty({
    description: 'Service name in Arabic',
    example: 'تطوير المواقع',
  })
  @Column({ type: 'varchar', length: 100 })
  nameAr: string;

  @ApiProperty({
    description: 'Service description in English',
    example: 'Full-stack web development services',
  })
  @Column({ type: 'text', nullable: true })
  descriptionEn?: string;

  @ApiProperty({
    description: 'Service description in Arabic',
    example: 'خدمات تطوير المواقع المتكاملة',
  })
  @Column({ type: 'text', nullable: true })
  descriptionAr?: string;

  @ApiProperty({
    description: 'Localized service name',
    example: 'Web Development',
  })
  name: string;

  @ApiProperty({
    description: 'Localized service description',
    example: 'Full-stack web development services',
  })
  description?: string;

  @ApiProperty({
    description: 'Service icon/image URL',
    example: 'https://example.com/icons/web-dev.png',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  icon?: string;

  @ApiProperty({
    description: 'Service image URL',
    example: 'https://example.com/images/service.jpg',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @ApiProperty({
    description: 'Whether the service is active',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Service display order',
    example: 1,
  })
  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder: number;

  @ApiProperty({
    description: 'Service creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Service last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ApiProperty({
    description: 'Projects under this service',
    type: () => [Project],
    required: false,
    readOnly: true,
    isArray: true,
    deprecated: true,
  })
  @OneToMany(() => Project, (project) => project.service)
  projects: Project[];

  @ApiProperty({
    description: 'Pricing plans for this service',
    type: () => [PricingPlan],
    required: false,
    readOnly: true,
    isArray: true,
    deprecated: true,
  })
  @OneToMany(() => PricingPlan, (pricingPlan) => pricingPlan.service)
  pricingPlans: PricingPlan[];

  // Virtual fields
  @ApiProperty({
    description: 'Number of projects under this service',
    example: 15,
  })
  get projectCount(): number {
    return this.projects?.length || 0;
  }
}
