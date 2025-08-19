import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { DiscountType } from '../../common/enums';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Coupon code (must be unique)',
    example: 'SAVE20',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50)
  @Transform(({ value }) => value?.toUpperCase())
  code: string;

  @ApiPropertyOptional({
    description: 'Coupon description',
    example: 'Save 20% on your order',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Discount type',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    description: 'Discount value (percentage 0-100 or fixed amount)',
    example: 20,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Minimum order amount to apply coupon',
    example: 100.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum discount amount (for percentage discounts)',
    example: 50.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  maximumDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Usage limit (total number of times coupon can be used)',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({
    description: 'Usage limit per user',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiProperty({
    description: 'Whether the coupon is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Coupon start date (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Coupon expiry date (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDateString()
  expiryDate: string;
}
