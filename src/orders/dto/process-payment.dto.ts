import { IsEnum, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../common/enums';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Payment method used',
    enum: PaymentMethod,
    example: PaymentMethod.MOYASAR,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Payment transaction ID from payment gateway',
    example: 'txn_1234567890',
  })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Payment amount (for verification)',
    example: 299.99,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Payment gateway response/reference',
    example: 'Payment successful',
  })
  @IsString()
  @IsOptional()
  paymentReference?: string;
}
