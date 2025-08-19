import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsUrl,
  IsDateString,
  ValidateIf,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IntegrationType } from '../entities/banner.entity';

export class CreateBannerDto {
  @ApiProperty({
    description: 'Banner title',
    example: 'Summer Sale - Up to 50% Off!',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiPropertyOptional({
    description: 'Banner description/text',
    example: 'Shop our amazing summer collection with huge discounts',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Banner image URL',
    example: 'https://example.com/images/summer-sale-banner.jpg',
  })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({
    description: 'Integration type that determines what the banner links to',
    enum: IntegrationType,
    example: IntegrationType.CATEGORY,
  })
  @IsEnum(IntegrationType)
  integrationType: IntegrationType;

  @ApiPropertyOptional({
    description: 'Product ID (required when integration type is product)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ValidateIf((o) => o.integrationType === IntegrationType.PRODUCT)
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Category ID (required when integration type is category)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ValidateIf((o) => o.integrationType === IntegrationType.CATEGORY)
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description:
      'Subcategory ID (required when integration type is subcategory)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ValidateIf((o) => o.integrationType === IntegrationType.SUBCATEGORY)
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({
    description: 'Service ID (required when integration type is service)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ValidateIf((o) => o.integrationType === IntegrationType.SERVICE)
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({
    description:
      'External URL (required when integration type is external_url)',
    example: 'https://example.com/special-offer',
  })
  @ValidateIf((o) => o.integrationType === IntegrationType.EXTERNAL_URL)
  @IsUrl()
  externalUrl?: string;

  @ApiProperty({
    description: 'Display order for the banner (lower numbers appear first)',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number = 0;

  @ApiProperty({
    description: 'Whether the banner is active and should be displayed',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Banner start date (when it should start being displayed)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Banner end date (when it should stop being displayed)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
