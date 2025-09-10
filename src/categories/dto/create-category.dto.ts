import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubcategoryDto {
  @ApiProperty({
    description: 'Subcategory name',
    example: 'Smartphones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Subcategory description',
    example: 'Mobile phones and smartphones',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Subcategory image URL',
    example: 'https://cdn.example.com/subcategory.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Subcategory image Cloudinary public ID',
    example: 'subcategories/image/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @ApiProperty({
    description: 'Subcategory icon URL',
    example: 'https://cdn.example.com/icon.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({
    description: 'Subcategory icon Cloudinary public ID',
    example: 'subcategories/icon/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconPublicId?: string;

  @ApiProperty({
    description: 'Subcategory banner image URL',
    example: 'https://cdn.example.com/banner.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @ApiProperty({
    description: 'Subcategory banner image Cloudinary public ID',
    example: 'subcategories/banner/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  bannerImagePublicId?: string;
}

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Electronic devices and accessories',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category image URL',
    example: 'https://cdn.example.com/category.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Category image Cloudinary public ID',
    example: 'categories/image/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @ApiProperty({
    description: 'Category icon URL',
    example: 'https://cdn.example.com/icon.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({
    description: 'Category icon Cloudinary public ID',
    example: 'categories/icon/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconPublicId?: string;

  @ApiProperty({
    description: 'Subcategories to create with this category',
    type: [CreateSubcategoryDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubcategoryDto)
  subcategories?: CreateSubcategoryDto[];
}
