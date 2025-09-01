import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, Max, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Product ID to review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Review rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review title',
    example: 'Great product!',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Review content',
    example: 'This product exceeded my expectations. Highly recommend!',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
