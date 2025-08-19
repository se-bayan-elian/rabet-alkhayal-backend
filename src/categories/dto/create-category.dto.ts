import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
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
