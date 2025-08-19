import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FeatureDto {
  @ApiPropertyOptional({
    description: 'Feature ID (for updates)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

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
    description: 'Feature quantity',
    example: 'Up to 5 pages',
  })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiPropertyOptional({
    description: 'Feature icon',
    example: 'fas fa-mobile-alt',
  })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpsertPricingPlanDto {
  @ApiPropertyOptional({
    description: 'Pricing plan ID (for updates)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  serviceId: string;

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

  @ApiProperty({
    description: 'Features included in this pricing plan',
    type: [FeatureDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features: FeatureDto[];
}
