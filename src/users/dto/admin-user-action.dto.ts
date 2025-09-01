import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class AdminUserActionDto {
  @ApiPropertyOptional({
    description: 'Set user as verified',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Set user as active/inactive',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
