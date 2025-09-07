import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProductReviewsDto {
  @ApiPropertyOptional({
    description: 'Filter by rating',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'newest',
    enum: ['newest', 'oldest', 'highest', 'lowest'],
  })
  @IsOptional()
  @IsIn(['newest', 'oldest', 'highest', 'lowest'])
  sort?: string = 'newest';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

