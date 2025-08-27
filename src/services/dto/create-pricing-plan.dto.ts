import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateFeatureDto } from './create-feature.dto';

export class CreatePricingPlanDto {
  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'Plan name',
    example: 'Basic Plan',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Perfect for small businesses getting started',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Original price before any discounts',
    example: 399.99,
  })
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty({
    description: 'Final price after discounts',
    example: 299.99,
  })
  @IsNumber()
  @Min(0)
  finalPrice: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Billing period (monthly, yearly, one-time)',
    example: 'monthly',
    default: 'one-time',
  })
  @IsOptional()
  @IsString()
  billingPeriod?: string;

  @ApiPropertyOptional({
    description: 'Delivery time in days',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  deliveryDays?: number;

  @ApiPropertyOptional({
    description: 'Number of revisions included',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  revisions?: number;

  @ApiPropertyOptional({
    description: 'Whether the plan is popular',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @ApiPropertyOptional({
    description: 'Features included in this plan',
    type: () => [CreateFeatureDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFeatureDto)
  features?: CreateFeatureDto[];
}
