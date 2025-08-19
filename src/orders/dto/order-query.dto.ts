import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { PaymentStatus, OrderStatus } from '../../common/enums';

export class OrderQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Start date for date range filter (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for date range filter (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsOptional()
  endDate?: Date;
}
