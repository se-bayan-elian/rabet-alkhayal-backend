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
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner, IntegrationType } from './entities/banner.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/helpers/enums';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // PUBLIC ENDPOINTS
  @Get('active')
  @ApiOperation({ summary: 'Get all active banners for display' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active banners retrieved successfully',
    type: [Banner],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of banners to return',
    example: 10,
    type: Number,
  })
  getActiveBanners(@Query('limit') limit?: number): Promise<Banner[]> {
    return this.bannersService.getActiveBanners(limit);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Record a banner view (increment view count)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner view recorded successfully',
  })
  recordView(@Param('id') id: string): Promise<void> {
    return this.bannersService.recordView(id);
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Record a banner click (increment click count)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner click recorded successfully',
  })
  recordClick(@Param('id') id: string): Promise<void> {
    return this.bannersService.recordClick(id);
  }

  // ADMIN ENDPOINTS
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new banner (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Banner created successfully',
    type: Banner,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid banner data',
  })
  create(@Body() createBannerDto: CreateBannerDto): Promise<Banner> {
    return this.bannersService.create(createBannerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all banners (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banners retrieved successfully',
    type: [Banner],
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'integrationType',
    required: false,
    description: 'Filter by integration type',
    enum: IntegrationType,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title or description',
    type: String,
  })
  findAll(
    @Query('isActive') isActive?: boolean,
    @Query('integrationType') integrationType?: IntegrationType,
    @Query('search') search?: string,
  ): Promise<Banner[]> {
    return this.bannersService.findAll({ isActive, integrationType, search });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get banner by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner retrieved successfully',
    type: Banner,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banner not found',
  })
  findOne(@Param('id') id: string): Promise<Banner> {
    return this.bannersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner updated successfully',
    type: Banner,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banner not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid banner data',
  })
  update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<Banner> {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Banner deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Banner not found',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.bannersService.remove(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get banner statistics (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        viewCount: { type: 'number', example: 2500 },
        clickCount: { type: 'number', example: 125 },
        clickThroughRate: { type: 'number', example: 5.2 },
        isScheduled: { type: 'boolean', example: true },
        daysActive: { type: 'number', example: 30 },
      },
    },
  })
  getStats(@Param('id') id: string) {
    return this.bannersService.getBannerStats(id);
  }

  @Patch(':id/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner display order (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banner order updated successfully',
    type: Banner,
  })
  updateOrder(
    @Param('id') id: string,
    @Body('displayOrder') displayOrder: number,
  ): Promise<Banner> {
    return this.bannersService.updateDisplayOrder(id, displayOrder);
  }
}
