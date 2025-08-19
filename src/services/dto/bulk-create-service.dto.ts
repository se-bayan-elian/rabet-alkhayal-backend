import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkCreateFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'Responsive Design',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Feature description',
    example: 'Mobile-friendly responsive web design',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Feature icon',
    example: 'fas fa-mobile-alt',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class BulkCreatePricingPlanDto {
  @ApiProperty({
    description: 'Plan name',
    example: 'Basic',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Original price',
    example: 999.99,
  })
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty({
    description: 'Discounted price',
    example: 799.99,
  })
  @IsNumber()
  @Min(0)
  discountedPrice: number;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Basic plan includes essential features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Features for this plan',
    type: [BulkCreateFeatureDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateFeatureDto)
  features?: BulkCreateFeatureDto[];
}

export class BulkCreateProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'E-commerce Website',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Modern e-commerce platform with advanced features',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Main project image URL',
    example: 'https://example.com/projects/ecommerce.jpg',
  })
  @IsString()
  mainImageUrl: string;

  @ApiPropertyOptional({
    description: 'External live link',
    example: 'https://demo.ecommerce.com',
  })
  @IsOptional()
  @IsString()
  externalLink?: string;
}

export class BulkCreateServiceDto {
  @ApiProperty({
    description: 'Service name in English',
    example: 'Web Development',
  })
  @IsString()
  nameEn: string;

  @ApiProperty({
    description: 'Service name in Arabic',
    example: 'تطوير المواقع',
  })
  @IsString()
  nameAr: string;

  @ApiPropertyOptional({
    description: 'Service description in English',
    example:
      'Complete web development solutions including frontend and backend',
  })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({
    description: 'Service description in Arabic',
    example: 'خدمات تطوير المواقع المتكاملة',
  })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({
    description: 'Service icon URL',
    example: 'https://example.com/icons/web-dev.png',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Service image URL',
    example: 'https://example.com/images/web-development.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Whether the service is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number = 0;

  @ApiPropertyOptional({
    description: 'Projects for this service',
    type: [BulkCreateProjectDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateProjectDto)
  projects?: BulkCreateProjectDto[];

  @ApiPropertyOptional({
    description: 'Pricing plans for this service',
    type: [BulkCreatePricingPlanDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreatePricingPlanDto)
  pricingPlans?: BulkCreatePricingPlanDto[];
}
