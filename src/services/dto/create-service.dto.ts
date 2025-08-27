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
    description: 'Service name',
    example: 'Web Development',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Service description',
    example:
      'Complete web development solutions including frontend and backend',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Service icon file (PNG, JPEG, JPG, max 5MB)',
    type: 'string',
    format: 'string',
  })
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Service icon file (PNG, JPEG, JPG, max 5MB)',
    type: 'string',
    format: 'string',
  })
  @IsOptional()
  iconPublicId?: string;

  @ApiPropertyOptional({
    description: 'Service main image file (PNG, JPEG, JPG, max 5MB)',
    type: 'string',
  })
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Service main image file (PNG, JPEG, JPG, max 5MB)',
    type: 'string',
  })
  @IsOptional()
  imagePublicId?: string;

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
