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
  ApiQuery,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { UpsertPricingPlanDto } from './dto/upsert-pricing-plan.dto';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { ContactFormDto } from './dto/contact-form.dto';
import { Service } from './entities/service.entity';
import { Project } from './entities/project.entity';
import { PricingPlan } from './entities/pricing-plan.entity';
import { Feature } from './entities/feature.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/helpers/enums';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // PUBLIC ENDPOINTS (for frontend display)

  @Get()
  @ApiOperation({
    summary: 'Get all active services (paginated)',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    type: String,
    description: 'Language code (en/ar)',
    example: 'en',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Services retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Service' },
          description: 'List of services',
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalItems: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('lang') lang = 'en',
  ) {
    return this.servicesService.findAllServices({ page, limit, lang });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID with full details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service retrieved successfully',
    type: Service,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  findOne(@Param('id') id: string) {
    return this.servicesService.findServiceById(id);
  }

  @Get(':id/projects')
  @ApiOperation({ summary: 'Get projects for a specific service' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Projects retrieved successfully',
    type: [Project],
  })
  findProjectsByService(@Param('id') serviceId: string) {
    return this.servicesService.findProjectsByService(serviceId);
  }

  @Get(':id/pricing-plans')
  @ApiOperation({ summary: 'Get pricing plans for a specific service' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pricing plans retrieved successfully',
    type: [PricingPlan],
  })
  findPricingPlansByService(@Param('id') serviceId: string) {
    return this.servicesService.findPricingPlansByService(serviceId);
  }

  @Post('contact')
  @ApiOperation({ summary: 'Submit contact form for service inquiry' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact form submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Thank you for your inquiry! We will get back to you soon.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  handleContactForm(@Body() contactFormDto: ContactFormDto) {
    return this.servicesService.handleContactForm(contactFormDto);
  }

  // ADMIN ENDPOINTS (protected)

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Create a new service with optional projects and pricing plans (Admin only)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully',
    type: Service,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.createService(createServiceDto);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all services including inactive (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Services retrieved successfully',
    type: [Service],
  })
  findAllAdmin() {
    return this.servicesService.findAllServicesAdmin();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service updated successfully',
    type: Service,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.updateService(id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete service (Admin only)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Service deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  remove(@Param('id') id: string) {
    return this.servicesService.deleteService(id);
  }

  // PROJECT MANAGEMENT (Admin only)

  @Post('projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully',
    type: Project,
  })
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.servicesService.createProject(createProjectDto);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project retrieved successfully',
    type: Project,
  })
  findProject(@Param('id') id: string) {
    return this.servicesService.findProjectById(id);
  }

  @Patch('projects/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project updated successfully',
    type: Project,
  })
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.servicesService.updateProject(id, updateProjectDto);
  }

  @Delete('projects/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete project (Admin only)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Project deleted successfully',
  })
  removeProject(@Param('id') id: string) {
    return this.servicesService.deleteProject(id);
  }

  // PRICING PLAN MANAGEMENT (Admin only)

  @Post('pricing-plans/upsert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create or update pricing plan with features (Admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pricing plan upserted successfully',
    type: PricingPlan,
  })
  upsertPricingPlan(@Body() upsertPricingPlanDto: UpsertPricingPlanDto) {
    return this.servicesService.upsertPricingPlan(upsertPricingPlanDto);
  }

  @Post('pricing-plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pricing plan (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pricing plan created successfully',
    type: PricingPlan,
  })
  createPricingPlan(@Body() createPricingPlanDto: CreatePricingPlanDto) {
    return this.servicesService.createPricingPlan(createPricingPlanDto);
  }

  @Get('pricing-plans/:id')
  @ApiOperation({ summary: 'Get pricing plan by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pricing plan retrieved successfully',
    type: PricingPlan,
  })
  findPricingPlan(@Param('id') id: string) {
    return this.servicesService.findPricingPlanById(id);
  }

  @Patch('pricing-plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pricing plan (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pricing plan updated successfully',
    type: PricingPlan,
  })
  updatePricingPlan(
    @Param('id') id: string,
    @Body() updatePricingPlanDto: UpdatePricingPlanDto,
  ) {
    return this.servicesService.updatePricingPlan(id, updatePricingPlanDto);
  }

  @Delete('pricing-plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete pricing plan (Admin only)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Pricing plan deleted successfully',
  })
  removePricingPlan(@Param('id') id: string) {
    return this.servicesService.deletePricingPlan(id);
  }

  // FEATURE MANAGEMENT (Admin only)

  @Post('features')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new feature (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Feature created successfully',
    type: Feature,
  })
  createFeature(@Body() createFeatureDto: CreateFeatureDto) {
    return this.servicesService.createFeature(createFeatureDto);
  }

  @Get('features')
  @ApiOperation({ summary: 'Get all features' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Features retrieved successfully',
    type: [Feature],
  })
  findAllFeatures() {
    return this.servicesService.findAllFeatures();
  }

  @Get('features/:id')
  @ApiOperation({ summary: 'Get feature by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feature retrieved successfully',
    type: Feature,
  })
  findFeature(@Param('id') id: string) {
    return this.servicesService.findFeatureById(id);
  }

  @Patch('features/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update feature (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feature updated successfully',
    type: Feature,
  })
  updateFeature(
    @Param('id') id: string,
    @Body() updateFeatureDto: UpdateFeatureDto,
  ) {
    return this.servicesService.updateFeature(id, updateFeatureDto);
  }

  @Delete('features/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete feature (Admin only)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Feature deleted successfully',
  })
  removeFeature(@Param('id') id: string) {
    return this.servicesService.deleteFeature(id);
  }
}
