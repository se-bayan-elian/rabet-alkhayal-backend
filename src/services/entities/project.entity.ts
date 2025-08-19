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
import { Service } from './service.entity';

@Entity('projects')
export class Project {
  @ApiProperty({
    description: 'Project ID',
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
    description: 'Project name',
    example: 'E-commerce Website',
  })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Modern e-commerce platform with advanced features',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Project image URL',
    example: 'https://example.com/projects/ecommerce.jpg',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @ApiProperty({
    description: 'Project gallery images (JSON array)',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  })
  @Column({ type: 'json', nullable: true })
  gallery?: string[];

  @ApiProperty({
    description: 'Technologies used (JSON array)',
    example: ['React', 'Node.js', 'MongoDB'],
  })
  @Column({ type: 'json', nullable: true })
  technologies?: string[];

  @ApiProperty({
    description: 'Project URL/demo link',
    example: 'https://demo.example.com',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  projectUrl?: string;

  @ApiProperty({
    description: 'GitHub repository URL',
    example: 'https://github.com/user/project',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  githubUrl?: string;

  @ApiProperty({
    description: 'Client name',
    example: 'ABC Company',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  clientName?: string;

  @ApiProperty({
    description: 'Project completion date',
    example: '2024-06-15T00:00:00.000Z',
  })
  @Column({ type: 'date', name: 'completion_date', nullable: true })
  completionDate?: Date;

  @ApiProperty({
    description: 'Whether the project is featured',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_featured', default: false })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Whether the project is visible',
    example: true,
  })
  @Column({ type: 'boolean', name: 'is_visible', default: true })
  isVisible: boolean;

  @ApiProperty({
    description: 'Project display order',
    example: 1,
  })
  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder: number;

  @ApiProperty({
    description: 'Project creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Project last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ApiProperty({
    description: 'Service this project belongs to',
    type: () => Service,
  })
  @ManyToOne(() => Service, (service) => service.projects)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // Virtual fields
  @ApiProperty({
    description: 'Number of gallery images',
    example: 5,
  })
  get galleryCount(): number {
    return this.gallery?.length || 0;
  }

  @ApiProperty({
    description: 'Number of technologies used',
    example: 3,
  })
  get technologyCount(): number {
    return this.technologies?.length || 0;
  }
}
