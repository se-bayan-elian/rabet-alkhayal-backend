import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IntegrationType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  SUBCATEGORY = 'subcategory',
  SERVICE = 'service',
  EXTERNAL_URL = 'external_url',
}

@Entity('banners')
export class Banner {
  @ApiProperty({
    description: 'Banner ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Banner title',
    example: 'Summer Sale - Up to 50% Off!',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({
    description: 'Banner description/text',
    example: 'Shop our amazing summer collection with huge discounts',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Banner image URL',
    example: 'https://example.com/images/summer-sale-banner.jpg',
  })
  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @ApiProperty({
    description: 'Integration type that determines what the banner links to',
    enum: IntegrationType,
    example: IntegrationType.CATEGORY,
  })
  @Column({
    type: 'enum',
    enum: IntegrationType,
    name: 'integration_type',
  })
  integrationType: IntegrationType;

  @ApiPropertyOptional({
    description: 'Product ID (when integration type is product)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'product_id', nullable: true })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Category ID (when integration type is category)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Subcategory ID (when integration type is subcategory)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'subcategory_id', nullable: true })
  subcategoryId?: string;

  @ApiPropertyOptional({
    description: 'Service ID (when integration type is service)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', name: 'service_id', nullable: true })
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'External URL (when integration type is external_url)',
    example: 'https://example.com/special-offer',
  })
  @Column({ type: 'varchar', length: 500, name: 'external_url', nullable: true })
  externalUrl?: string;

  @ApiProperty({
    description: 'Display order for the banner (lower numbers appear first)',
    example: 1,
  })
  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether the banner is active and should be displayed',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Banner start date (when it should start being displayed)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ type: 'timestamp', name: 'start_date', nullable: true })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Banner end date (when it should stop being displayed)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @Column({ type: 'timestamp', name: 'end_date', nullable: true })
  endDate?: Date;

  @ApiProperty({
    description: 'Number of times banner has been clicked',
    example: 125,
  })
  @Column({ type: 'int', name: 'click_count', default: 0 })
  clickCount: number;

  @ApiProperty({
    description: 'Number of times banner has been viewed',
    example: 2500,
  })
  @Column({ type: 'int', name: 'view_count', default: 0 })
  viewCount: number;

  @ApiProperty({
    description: 'Banner creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Banner last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  @ApiProperty({
    description: 'Whether the banner is currently scheduled to be displayed',
    example: true,
  })
  get isScheduled(): boolean {
    const now = new Date();
    
    if (!this.isActive) return false;
    
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    
    return true;
  }

  @ApiProperty({
    description: 'Click-through rate (CTR) as percentage',
    example: 5.2,
  })
  get clickThroughRate(): number {
    if (this.viewCount === 0) return 0;
    return (this.clickCount / this.viewCount) * 100;
  }

  @ApiProperty({
    description: 'The target URL or identifier based on integration type',
    example: '/categories/electronics',
  })
  get targetLink(): string {
    switch (this.integrationType) {
      case IntegrationType.PRODUCT:
        return `/products/${this.productId}`;
      case IntegrationType.CATEGORY:
        return `/categories/${this.categoryId}`;
      case IntegrationType.SUBCATEGORY:
        return `/subcategories/${this.subcategoryId}`;
      case IntegrationType.SERVICE:
        return `/services/${this.serviceId}`;
      case IntegrationType.EXTERNAL_URL:
        return this.externalUrl || '#';
      default:
        return '#';
    }
  }

  // Relations (Optional - you can add these if you want to include related data)
  // @ManyToOne(() => Product, { nullable: true })
  // @JoinColumn({ name: 'product_id' })
  // product?: Product;

  // @ManyToOne(() => Category, { nullable: true })
  // @JoinColumn({ name: 'category_id' })
  // category?: Category;

  // @ManyToOne(() => Subcategory, { nullable: true })
  // @JoinColumn({ name: 'subcategory_id' })
  // subcategory?: Subcategory;

  // @ManyToOne(() => Service, { nullable: true })
  // @JoinColumn({ name: 'service_id' })
  // service?: Service;
}
