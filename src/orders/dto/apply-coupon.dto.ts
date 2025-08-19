import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  IsOptional,
} from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({
    description: 'Coupon ID to apply',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  couponId: string;

  @ApiPropertyOptional({
    description: 'Discount amount (calculated automatically if not provided)',
    example: 50.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Coupon code for validation',
    example: 'SAVE20',
  })
  @IsString()
  @IsOptional()
  couponCode?: string;
}
