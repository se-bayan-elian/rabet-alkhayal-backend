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
    description: 'Option value',
    example: 'Large',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Extra price for this option value',
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
    description: 'Option name',
    example: 'Size',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Option type',
    enum: OptionType,
    example: OptionType.SELECT,
  })
  @IsEnum(OptionType)
  type: OptionType;

  @ApiProperty({
    description: 'Whether this option is required',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean = false;

  @ApiProperty({
    description: 'Available values for this option',
    type: [CreateProductOptionValueDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionValueDto)
  values?: CreateProductOptionValueDto[];
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
    description: 'Product options (customizations)',
    type: [CreateProductOptionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  options?: CreateProductOptionDto[];
}
