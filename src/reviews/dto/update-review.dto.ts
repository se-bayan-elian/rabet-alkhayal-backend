import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ReviewStatus } from '../entities/review.entity';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Review status',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Mark as featured',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
