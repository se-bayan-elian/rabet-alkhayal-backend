import {
  IsString,
  IsOptional,
  IsUrl,
  IsUUID,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Project title', example: 'E-commerce Website' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'Modern e-commerce platform with advanced features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Project main image URL',
    example: 'https://cloudinary.com/projects/ecommerce.jpg',
  })
  @IsOptional()
  @IsUrl()
  mainImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Project main image Cloudinary public ID',
    example: 'projects/main/ecommerce',
  })
  @IsOptional()
  @IsString()
  mainImagePublicId?: string;

  @ApiPropertyOptional({
    description: 'Gallery images',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://cdn.example.com/image.jpg' },
        public_id: { type: 'string', example: 'cloudinary-id' },
      },
    },
  })
  @IsOptional()
  @IsArray()
  gallery?: {
    url: string;
    public_id: string;
  }[];

  @ApiPropertyOptional({
    description: 'Project URL/demo link',
    example: 'https://demo.example.com',
  })
  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @ApiPropertyOptional({ description: 'Client name', example: 'ABC Company' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Project completion date',
    example: '2024-06-15',
  })
  @IsOptional()
  @IsDateString()
  completionDate?: string;
}
