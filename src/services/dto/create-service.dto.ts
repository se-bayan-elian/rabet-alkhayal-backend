import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateProjectDto } from './create-project.dto';
import { CreatePricingPlanDto } from './create-pricing-plan.dto';

export class CreateServiceDto {
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
    example: 'خدمات تطوير المواقع المتكاملة شاملة الواجهة الأمامية والخلفية',
  })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({
    description: 'Service icon URL (small icon)',
    example: 'https://example.com/icons/web-dev.png',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Service image URL (full size image)',
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
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Projects for this service',
    type: () => [CreateProjectDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectDto)
  projects?: CreateProjectDto[];

  @ApiPropertyOptional({
    description: 'Pricing plans for this service',
    type: () => [CreatePricingPlanDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePricingPlanDto)
  pricingPlans?: CreatePricingPlanDto[];
}
