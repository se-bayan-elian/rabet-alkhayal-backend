import {
  Controller,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Subcategories')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update subcategory by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subcategory updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subcategory not found',
  })
  @ApiParam({ name: 'id', description: 'Subcategory ID' })
  async updateSubcategory(@Param('id') id: string, @Body() body: any) {
    // Accept all possible fields for subcategory update
    return this.categoriesService.updateSubcategory(
      id,
      body.name,
      body.description,
      body.imageUrl,
      body.imagePublicId,
      body.iconUrl,
      body.iconPublicId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subcategory by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Subcategory deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subcategory not found',
  })
  @ApiParam({ name: 'id', description: 'Subcategory ID' })
  async removeSubcategory(@Param('id') id: string) {
    return this.categoriesService.removeSubcategory(id);
  }
}
