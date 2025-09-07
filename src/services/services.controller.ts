import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { Project } from './entities/project.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileUploadInterceptor } from '../common/interceptors/file-upload.interceptor';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/helpers/enums';
import { I18nTransformInterceptor } from '../common/interceptors/i18n-transform.interceptor';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { FindServicesDto } from './dto/find-services.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('services')
@Controller('services')
@UseInterceptors(I18nTransformInterceptor)
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User is not authorized',
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'User does not have required role',
})
export class ServicesController {
  @Delete(':serviceId/projects/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiOperation({ summary: 'Delete a project for a service' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project deleted successfully',
  })
  async deleteProject(
    @Param('serviceId') serviceId: string,
    @Param('projectId') projectId: string,
  ) {
    // Optionally, you can check if the project belongs to the service
    return this.servicesService.deleteProject(projectId);
  }
  @Post('projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiOperation({ summary: 'Create a new project (no serviceId in path)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully',
  })
  async createProjectNoServiceId(@Body() createProjectDto: CreateProjectDto) {
    // serviceId must be present in the DTO
    if (!createProjectDto.serviceId) {
      throw new NotFoundException('serviceId is required in the body');
    }
    return this.servicesService.createProject(
      createProjectDto.serviceId,
      createProjectDto,
    );
  }
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiOperation({
    summary: 'Create a new service',
    description:
      'Creates a new service with translations for name and description in both English and Arabic',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully',
    type: Service,
    schema: {
      example: {
        id: 'uuid-here',
        name: {
          en: 'Web Development',
          ar: 'تطوير المواقع',
        },
        description: {
          en: 'Complete web development solutions including frontend and backend',
          ar: 'خدمات تطوير المواقع المتكاملة شاملة الواجهة الأمامية والخلفية',
        },
        icon: 'https://example.com/icons/web-dev.png',
        image: 'https://example.com/images/web-development.jpg',
        projects: [],
        features: [],
        pricingPlans: [],
        createdAt: '2025-08-24T09:25:31.833Z',
        updatedAt: '2025-08-24T09:25:31.833Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input (missing required fields or invalid format)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have required role',
  })
  create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.servicesService.createService(createServiceDto);
  }

  @Post(':serviceId/pricing-plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiOperation({
    summary: 'Create a new pricing plan for a service',
    description:
      'Creates a new pricing plan with features for the specified service',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pricing plan created successfully',
  })
  createPricingPlan(
    @Param('serviceId') serviceId: string,
    @Body() createPricingPlanDto: CreatePricingPlanDto,
  ) {
    return this.servicesService.createPricingPlan({
      ...createPricingPlanDto,
      serviceId,
    });
  }

  @Delete(':serviceId/pricing-plans/:planId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiOperation({
    summary: 'Delete a pricing plan',
    description: 'Deletes a pricing plan and all its associated features',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Pricing plan deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pricing plan not found',
  })
  async deletePricingPlan(
    @Param('serviceId') serviceId: string,
    @Param('planId') planId: string,
  ) {
    // First verify that the plan belongs to the service
    const plan = await this.servicesService.findPricingPlanById(planId);
    if (plan.serviceId !== serviceId) {
      throw new NotFoundException('Pricing plan not found for this service');
    }
    await this.servicesService.deletePricingPlan(planId);
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Get featured services',
    description: 'Get a list of featured services for homepage display.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns list of featured services',
    type: [Service],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of featured services to return (default: 6, max: 8)',
  })
  getFeaturedServices(@Query('limit') limit?: number) {
    const maxLimit = Math.min(limit || 6, 8);
    return this.servicesService.findAllServices({
      limit: maxLimit,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all services',
    description:
      'Get a paginated list of services. Can search by name or description.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated list of services',
    schema: {
      example: {
        data: [
          {
            id: 'uuid-here',
            name: 'Web Development',
            description: 'Complete web development solutions',
            icon: 'https://example.com/icons/web-dev.png',
            image: 'https://example.com/images/web-development.jpg',
            projects: [],
            features: [],
            pricingPlans: [],
            createdAt: '2025-08-24T09:25:31.833Z',
            updatedAt: '2025-08-24T09:25:31.833Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Search query - will search in name and description',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  findAll(@Query() query: FindServicesDto) {
    return this.servicesService.findAllServices(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a service by id',
    description:
      'Retrieves detailed information about a specific service including translations',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a service by id with translations',
    schema: {
      example: {
        id: 'uuid-here',
        name: {
          en: 'Web Development',
          ar: 'تطوير المواقع',
        },
        description: {
          en: 'Complete web development solutions including frontend and backend',
          ar: 'خدمات تطوير المواقع المتكاملة شاملة الواجهة الأمامية والخلفية',
        },
        icon: 'https://example.com/icons/web-dev.png',
        image: 'https://example.com/images/web-development.jpg',
        projects: [
          {
            id: 'project-uuid',
            title: {
              en: 'E-commerce Platform',
              ar: 'منصة التجارة الإلكترونية',
            },
            description: {
              en: 'Modern e-commerce solution',
              ar: 'حل حديث للتجارة الإلكترونية',
            },
          },
        ],
        features: [
          {
            id: 'feature-uuid',
            name: {
              en: 'Responsive Design',
              ar: 'تصميم متجاوب',
            },
            description: {
              en: 'Works on all devices',
              ar: 'يعمل على جميع الأجهزة',
            },
          },
        ],
        pricingPlans: [
          {
            id: 'plan-uuid',
            name: {
              en: 'Basic Plan',
              ar: 'الخطة الأساسية',
            },
            description: {
              en: 'Perfect for small businesses',
              ar: 'مثالي للشركات الصغيرة',
            },
            price: 99.99,
          },
        ],
        createdAt: '2025-08-24T09:25:31.833Z',
        updatedAt: '2025-08-24T09:25:31.833Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  findOne(@Param('id') id: string): Promise<Service> {
    return this.servicesService.findServiceById(id);
  }

  @Get(':id/pricing-plans')
  @ApiOperation({
    summary: 'Get pricing plans for a service',
    description:
      'Retrieves all pricing plans associated with a specific service',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns pricing plans for the specified service',
    schema: {
      example: [
        {
          id: '431c146b-64b4-4559-a101-bf7a6067c09f',
          name: 'Basic Plan',
          description: 'Perfect for small businesses',
          originalPrice: 1100,
          finalPrice: 900,
          billingPeriod: 'one-time',
          deliveryDays: 7,
          revisions: 3,
          quantity: 1,
          isActive: true,
          isPopular: true,
          displayOrder: 2,
          createdAt: '2025-08-26T08:00:00.000Z',
          updatedAt: '2025-08-26T09:15:00.000Z',
          service: {
            id: '86b805dc-3b8a-421c-80ad-ff0e6a162390',
            name: 'Web Development',
          },
          features: [
            {
              id: '550e8400-e29b-41d4-a716-446655440004',
              name: 'Feature 1',
              description: 'Feature 1 description',
              isIncluded: true,
            },
            {
              id: '660e8400-e29b-41d4-a716-446655440005',
              name: 'Feature 2',
              description: 'Feature 2 description',
              isIncluded: true,
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async getPricingPlans(@Param('id') id: string) {
    return this.servicesService.findPricingPlansByService(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Update a service',
    description:
      'Update service information including translations. All fields are optional.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service updated successfully',
    schema: {
      example: {
        id: 'uuid-here',
        name: {
          en: 'Updated Web Development',
          ar: 'تطوير المواقع المحدث',
        },
        description: {
          en: 'Updated web development solutions including frontend and backend',
          ar: 'خدمات تطوير المواقع المتكاملة المحدثة شاملة الواجهة الأمامية والخلفية',
        },
        icon: 'https://example.com/icons/web-dev-updated.png',
        image: 'https://example.com/images/web-development-updated.jpg',
        projects: [],
        features: [],
        pricingPlans: [],
        createdAt: '2025-08-24T09:25:31.833Z',
        updatedAt: '2025-08-24T09:25:31.833Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input format for translations or other fields',
  })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.updateService(id, updateServiceDto);
  }

  @Post('projects/:id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload project main image' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project image uploaded successfully',
  })
  async uploadProjectImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<Project> {
    return this.servicesService.uploadProjectImage(id, file);
  }

  @Post('projects/:id/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload project gallery image' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project gallery image uploaded successfully',
  })
  async uploadProjectGalleryImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<Project> {
    return this.servicesService.uploadProjectGalleryImage(id, file);
  }

  @Delete('projects/:id/gallery/:imageIndex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Remove project gallery image' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project gallery image removed successfully',
  })
  async removeProjectGalleryImage(
    @Param('id') id: string,
    @Param('imageIndex') imageIndex: number,
  ): Promise<Project> {
    return this.servicesService.removeProjectGalleryImage(id, imageIndex);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Delete a service',
    description:
      'Permanently removes a service and all associated data (projects, features, pricing plans)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service deleted successfully',
    schema: {
      example: {
        message: 'Service deleted successfully',
        id: 'uuid-here',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have sufficient permissions',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.servicesService.deleteService(id);
  }

  @Post(':id/icon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service icon uploaded successfully',
    type: Service,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async uploadIcon(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<Service> {
    return this.servicesService.uploadIcon(id, file);
  }

  @Patch(':serviceId/pricing-plans/:planId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiOperation({
    summary: 'Update a pricing plan',
    description: 'Updates a specific pricing plan within a service',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pricing plan updated successfully',
    schema: {
      example: {
        id: 'plan-uuid',
        name: 'Updated Plan',
        description: 'Updated plan description',
        originalPrice: 1100,
        finalPrice: 900,
        billingPeriod: 'one-time',
        deliveryDays: 7,
        revisions: 3,
        isActive: true,
        isPopular: true,
        displayOrder: 2,
        features: [],
        updatedAt: '2025-08-26T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service or pricing plan not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input format',
  })
  updatePricingPlan(
    @Param('serviceId') serviceId: string,
    @Param('planId') planId: string,
    @Body() updatePricingPlanDto: UpdatePricingPlanDto,
  ) {
    return this.servicesService.updatePricingPlan(
      serviceId,
      planId,
      updatePricingPlanDto,
    );
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service image uploaded successfully',
    type: Service,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<Service> {
    return this.servicesService.uploadImage(id, file);
  }

  @Post(':serviceId/projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new project for a service' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully',
  })
  async createProject(
    @Param('serviceId') serviceId: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.servicesService.createProject(serviceId, createProjectDto);
  }

  @Get(':serviceId/projects')
  @ApiOperation({ summary: 'Get all projects for a service' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all projects for the service',
  })
  async getProjects(@Param('serviceId') serviceId: string) {
    return this.servicesService.getProjects(serviceId);
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get a single project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the project' })
  async getProject(@Param('projectId') projectId: string) {
    return this.servicesService.getProject(projectId);
  }

  @Patch('projects/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project updated successfully',
  })
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.servicesService.updateProject(projectId, updateProjectDto);
  }

  @Patch(':serviceId/projects/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @ApiOperation({
    summary: 'Update a project for a service (supports form data)',
  })
  @ApiConsumes('multipart/form-data')
  async updateProjectForService(
    @Param('serviceId') serviceId: string,
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.servicesService.updateProjectForService(
      serviceId,
      projectId,
      updateProjectDto,
    );
  }
}
