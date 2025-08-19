import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { PaginatedResponseDto } from '../common/repository/dto/paginated-response.dto';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new category with optional subcategories',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: Category,
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories with advanced filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    type: PaginatedResponseDto<Category>,
  })
  @ApiQuery({
    name: 'pagination',
    required: false,
    description: 'Pagination options',
    example: '{"page": 1, "limit": 10}',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search categories by name',
    example: '{"query": "electronics", "fields": ["name"]}',
  })
  findAll(@Query() queryOptionsDto: QueryOptionsDto) {
    return this.categoriesService.findAll(queryOptionsDto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get categories with statistics (subcategory and product counts)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category statistics retrieved successfully',
  })
  getCategoriesWithStats() {
    return this.categoriesService.getCategoriesWithStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore soft deleted category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category restored successfully',
  })
  restore(@Param('id') id: string) {
    return this.categoriesService.restore(id);
  }

  // Subcategory endpoints
  @Post(':categoryId/subcategories')
  @ApiOperation({ summary: 'Create a new subcategory for a category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subcategory created successfully',
    type: Subcategory,
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  createSubcategory(
    @Param('categoryId') categoryId: string,
    @Body('name') name: string,
  ) {
    return this.categoriesService.createSubcategory(categoryId, name);
  }

  @Get(':categoryId/subcategories')
  @ApiOperation({ summary: 'Get subcategories for a category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subcategories retrieved successfully',
    type: PaginatedResponseDto<Subcategory>,
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  getSubcategories(
    @Param('categoryId') categoryId: string,
    @Query() queryOptionsDto: QueryOptionsDto,
  ) {
    return this.categoriesService.getSubcategories(categoryId, queryOptionsDto);
  }

  @Get('subcategories/stats')
  @ApiOperation({ summary: 'Get subcategories with statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subcategory statistics retrieved successfully',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  getSubcategoriesWithStats(@Query('categoryId') categoryId?: string) {
    return this.categoriesService.getSubcategoriesWithStats(categoryId);
  }

  @Patch('subcategories/:subcategoryId')
  @ApiOperation({ summary: 'Update subcategory by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subcategory updated successfully',
    type: Subcategory,
  })
  @ApiParam({ name: 'subcategoryId', description: 'Subcategory ID' })
  updateSubcategory(
    @Param('subcategoryId') subcategoryId: string,
    @Body('name') name: string,
  ) {
    return this.categoriesService.updateSubcategory(subcategoryId, name);
  }

  @Delete('subcategories/:subcategoryId')
  @ApiOperation({ summary: 'Delete subcategory by ID (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Subcategory deleted successfully',
  })
  @ApiParam({ name: 'subcategoryId', description: 'Subcategory ID' })
  removeSubcategory(@Param('subcategoryId') subcategoryId: string) {
    return this.categoriesService.removeSubcategory(subcategoryId);
  }
}
