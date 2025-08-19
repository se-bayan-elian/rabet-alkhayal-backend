import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { PaymentMethod } from '../../common/enums';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Cart ID to create order from',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  cartId: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.MOYASAR,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Google address for delivery',
    example: '123 Main St, City, Country',
  })
  @IsString()
  @IsNotEmpty()
  googleAddress: string;

  @ApiPropertyOptional({
    description: 'Whether delivery is enabled',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  deliveryEnabled?: boolean = false;

  @ApiPropertyOptional({
    description: 'Delivery fee',
    example: 15.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number = 0;

  @ApiPropertyOptional({
    description: 'Tax amount',
    example: 29.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number = 0;

  @ApiPropertyOptional({
    description: 'Coupon ID to apply',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  couponId?: string;
}
