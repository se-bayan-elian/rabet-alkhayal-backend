import { IsString, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'Project title',
    example: 'E-commerce Website',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Modern e-commerce platform with advanced features',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Main project image URL',
    example: 'https://example.com/projects/ecommerce.jpg',
  })
  @IsUrl()
  mainImageUrl: string;

  @ApiPropertyOptional({
    description: 'External live link',
    example: 'https://demo.ecommerce.com',
  })
  @IsOptional()
  @IsUrl()
  externalLink?: string;
}
