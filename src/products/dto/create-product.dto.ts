import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OptionType } from '../../common/helpers/enums';

export class CreateProductOptionValueDto {
  @ApiProperty({
    description: 'Answer text/value',
    example: 'Large',
  })
  @IsString()
  @IsNotEmpty()
  answerText: string;

  @ApiProperty({
    description: 'Answer image URL (for IMAGE type questions)',
    example: 'https://cdn.example.com/answer-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Answer image Cloudinary public ID',
    example: 'answers/images/answer-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @ApiProperty({
    description: 'Extra price for this answer',
    example: 10.0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  extraPrice?: number = 0;
}

export class CreateProductOptionDto {
  @ApiProperty({
    description: 'Question text for this option',
    example: 'What size would you like?',
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    description: 'Question type',
    enum: OptionType,
    example: OptionType.SELECT,
  })
  @IsEnum(OptionType)
  type: OptionType;

  @ApiProperty({
    description: 'Whether this question is required',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean = false;

  @ApiProperty({
    description: 'Available answers for this question',
    type: [CreateProductOptionValueDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionValueDto)
  answers?: CreateProductOptionValueDto[];
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Original price',
    example: 999.99,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  originalPrice: number;

  @ApiProperty({
    description: 'Discounted price',
    example: 899.99,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  discountedPrice: number;

  @ApiProperty({
    description: 'Product weight in kg',
    example: 0.5,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  weight: number;

  @ApiProperty({
    description: 'Is this product featured',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiProperty({
    description: 'Subcategory ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  subcategoryId: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://cdn.example.com/product-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Product image Cloudinary public ID',
    example: 'products/images/product-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @ApiProperty({
    description: 'Product questions (customizations)',
    type: [CreateProductOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  questions?: CreateProductOptionDto[];
}
