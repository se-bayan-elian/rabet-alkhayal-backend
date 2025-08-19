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
    description: 'Features included in this plan',
    type: () => [CreateFeatureDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeatureDto)
  features?: CreateFeatureDto[];
}
