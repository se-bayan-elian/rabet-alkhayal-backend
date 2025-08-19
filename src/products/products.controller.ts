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
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { PaginatedResponseDto } from '../common/repository/dto/paginated-response.dto';
import { transformQueryParams } from '../common/repository/utils/query-transform.util';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/helpers/enums';

@ApiTags('products')
@Controller('products')
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new product with options and values' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: Product,
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all products with advanced filtering, sorting, pagination, search, and price range',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    type: PaginatedResponseDto<Product>,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starting from 1)',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (1-100)',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort options: [{"field": "createdAt", "direction": "DESC"}]',
    example: '[{"field": "name", "direction": "ASC"}]',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description:
      'Filter options: [{"field": "subcategoryId", "operator": "eq", "value": "123e4567-e89b-12d3-a456-426614174000"}]',
    example:
      '[{"field": "subcategoryId", "operator": "eq", "value": "123e4567-e89b-12d3-a456-426614174000"}]',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query to find products by name, description, etc.',
    example: 'iPhone',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    example: 100,
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    example: 1000,
    type: Number,
  })
  @ApiQuery({
    name: 'subcategoryId',
    required: false,
    description: 'Filter by subcategory ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  findAll(@Query() query: any) {
    const queryOptionsDto = transformQueryParams(query);
    return this.productsService.findAll(queryOptionsDto);
  }

  @Get('subcategory/:subcategoryId')
  @ApiOperation({ summary: 'Get products by subcategory' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products by subcategory retrieved successfully',
    type: PaginatedResponseDto<Product>,
  })
  findBySubcategory(
    @Param('subcategoryId', ParseUUIDPipe) subcategoryId: string,
    @Query() queryOptionsDto: QueryOptionsDto,
  ) {
    return this.productsService.findBySubcategory(
      subcategoryId,
      queryOptionsDto,
    );
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Featured products retrieved successfully',
    type: [Product],
  })
  @ApiQuery({
    name: 'mode',
    required: false,
    description:
      'Mode for getting featured products: "manual" (by isFeatured flag) or "auto" (by most sold)',
    example: 'manual',
    enum: ['manual', 'auto'],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of featured products to return (max 8)',
    example: 8,
    type: Number,
  })
  getFeaturedProducts(
    @Query('mode') mode: 'manual' | 'auto' = 'manual',
    @Query('limit') limit: number = 8,
  ) {
    const maxLimit = Math.min(limit, 8);
    return this.productsService.getFeaturedProducts(mode, maxLimit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID with full details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete product by ID (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Put(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Restore soft deleted product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product restored successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }
}
