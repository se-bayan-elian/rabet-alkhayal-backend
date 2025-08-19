import { IsUUID, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CartCustomizationDto {
  @ApiProperty({
    description: 'Product option ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  optionId: string;

  @ApiProperty({
    description: 'Option name',
    example: 'Size',
  })
  @IsString()
  optionName: string;

  @ApiPropertyOptional({
    description: 'Selected value for predefined options',
    example: 'XL',
  })
  @IsOptional()
  @IsString()
  selectedValue?: string;

  @ApiPropertyOptional({
    description: 'Customer input for text fields',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  customerInput?: string;

  @ApiProperty({
    description: 'Additional price for this customization',
    example: 5.99,
  })
  @IsNumber()
  @Min(0)
  additionalPrice: number;
}

export class AddToCartDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity to add',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unit price at time of adding to cart',
    example: 99.99,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Product customizations',
    type: [CartCustomizationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartCustomizationDto)
  customizations?: CartCustomizationDto[];
}

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}
