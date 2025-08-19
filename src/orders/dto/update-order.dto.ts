import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus, OrderStatus } from '../../common/enums';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;
}
