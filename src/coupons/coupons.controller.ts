import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from 'src/common/helpers/enums';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // PUBLIC ENDPOINTS
  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code and calculate discount' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupon validated successfully',
    schema: {
      type: 'object',
      properties: {
        coupon: { $ref: '#/components/schemas/Coupon' },
        discount: { type: 'number', example: 15.5 },
        isValid: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Coupon applied successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid coupon or does not meet requirements',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'Coupon is not valid or has expired',
        },
      },
    },
  })
  async validateCoupon(
    @Body() body: { code: string; orderTotal: number; userId?: string },
  ) {
    try {
      const { coupon, discount } = await this.couponsService.applyCoupon(
        body.code,
        body.orderTotal,
        body.userId,
      );

      return {
        coupon,
        discount,
        isValid: true,
        message: 'Coupon applied successfully',
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || 'Invalid coupon code',
        discount: 0,
      };
    }
  }

  // ADMIN ENDPOINTS
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new coupon (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coupon created successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  create(@Body() createCouponDto: CreateCouponDto): Promise<Coupon> {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all coupons (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupons retrieved successfully',
    type: [Coupon],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'isValid',
    required: false,
    description: 'Filter by validity (active and not expired)',
    type: Boolean,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by coupon code or description',
    type: String,
  })
  findAll(
    @Query('isActive') isActive?: boolean,
    @Query('isValid') isValid?: boolean,
    @Query('search') search?: string,
  ): Promise<Coupon[]> {
    return this.couponsService.findAll({ isActive, isValid, search });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupon retrieved successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  findOne(@Param('id') id: string): Promise<Coupon> {
    return this.couponsService.findOne(id);
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon by code (Admin only)' })
  @ApiParam({ name: 'code', description: 'Coupon code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupon retrieved successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  findByCode(@Param('code') code: string): Promise<Coupon> {
    return this.couponsService.findByCode(code);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update coupon (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupon updated successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid coupon data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete coupon (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Coupon deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.couponsService.remove(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon usage statistics (Admin only)' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupon statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsage: { type: 'number', example: 25 },
        remainingUsage: { type: 'number', example: 75 },
        usageRate: { type: 'number', example: 25.5 },
        totalDiscountGiven: { type: 'number', example: 1250.75 },
        averageOrderValue: { type: 'number', example: 120.5 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  getStats(@Param('id') id: string) {
    return this.couponsService.getCouponStats(id);
  }
}
