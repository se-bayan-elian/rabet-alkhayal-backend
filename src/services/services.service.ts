/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial } from 'typeorm';
import { Service } from './entities/service.entity';
import { Project } from './entities/project.entity';
import { PricingPlan } from './entities/pricing-plan.entity';
import { Feature } from './entities/feature.entity';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { BaseRepository } from '../common/repository/base.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { ContactFormDto } from './dto/contact-form.dto';
import { PinoLogger } from 'nestjs-pino';
import { CloudinaryService } from 'src/common/services/cloudinary.service';

@Injectable()
export class ServicesService extends BaseRepository<Service> {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(PricingPlan)
    private readonly pricingPlanRepository: Repository<PricingPlan>,
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    private readonly logger: PinoLogger,
    private readonly cloudinaryService: CloudinaryService,
    dataSource: DataSource,
  ) {
    super(serviceRepository, dataSource);
    this.logger.setContext(ServicesService.name);
  }

  // Service CRUD
  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    this.logger.info(`Creating service: ${createServiceDto.name}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate required translations
      if (!createServiceDto.name) {
        throw new BadRequestException('Service name is required');
      }

      // Assign icon and image URLs/public IDs directly from DTO
      const serviceData: DeepPartial<Service> = {
        name: createServiceDto.name,
        description: createServiceDto.description,
        icon: createServiceDto.icon,
        iconPublicId: createServiceDto.iconPublicId,
        image: createServiceDto.image,
        imagePublicId: createServiceDto.imagePublicId,
        isActive: createServiceDto.isActive ?? true,
      };
      const service = this.serviceRepository.create(serviceData);
      const savedService = await queryRunner.manager.save<Service>(service);

      // Create projects if provided
      if (createServiceDto.projects?.length > 0) {
        const projects = createServiceDto.projects.map((projectDto) => {
          const projectData: DeepPartial<Project> = {
            ...projectDto,
            serviceId: savedService.id,
          };
          return this.projectRepository.create(projectData);
        });
        await queryRunner.manager.save(Project, projects);
      }

      // Create pricing plans and their features if provided
      if (createServiceDto.pricingPlans?.length > 0) {
        for (const planDto of createServiceDto.pricingPlans) {
          // Create the pricing plan with proper field mapping
          const planData: DeepPartial<PricingPlan> = {
            name: planDto.name,
            description: planDto.description,
            serviceId: savedService.id,
            originalPrice: planDto.originalPrice,
            finalPrice: planDto.finalPrice,
            billingPeriod: 'monthly', // Set default period
            isActive: true,
          };
          const plan = this.pricingPlanRepository.create(planData);
          const savedPlan = await queryRunner.manager.save<PricingPlan>(plan);

          // Create features if provided
          if (planDto.features?.length > 0) {
            const features = planDto.features.map((featureDto) => {
              const featureData: DeepPartial<Feature> = {
                name: featureDto.name,
                description: featureDto.description,
                pricingPlanId: savedPlan.id,
                isIncluded: true,
              };
              return this.featureRepository.create(featureData);
            });
            await queryRunner.manager.save(Feature, features);
          }
        }
      }

      await queryRunner.commitTransaction();

      // Return the complete service with relations
      return this.findServiceById(savedService.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating service:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async uploadIcon(id: string, file: any): Promise<Service> {
    const service = await this.findServiceById(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Delete old icon if exists
    if (service.iconPublicId) {
      await this.cloudinaryService.deleteFile(service.iconPublicId);
    }

    const { url, public_id } = await this.cloudinaryService.uploadFile(
      file,
      'services/icons',
    );

    service.icon = url;
    service.iconPublicId = public_id;
    return this.serviceRepository.save(service);
  }

  async uploadImage(id: string, file: any): Promise<Service> {
    const service = await this.findServiceById(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Delete old image if exists
    if (service.imagePublicId) {
      await this.cloudinaryService.deleteFile(service.imagePublicId);
    }

    const { url, public_id } = await this.cloudinaryService.uploadFile(
      file,
      'services/images',
    );

    service.image = url;
    service.imagePublicId = public_id;
    return this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findServiceById(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Delete associated files from Cloudinary
    if (service.iconPublicId) {
      await this.cloudinaryService.deleteFile(service.iconPublicId);
    }
    if (service.imagePublicId) {
      await this.cloudinaryService.deleteFile(service.imagePublicId);
    }

    await this.serviceRepository.remove(service);
  }

  async findAllServices(options: {
    page?: number;
    limit?: number;
    q?: string;
  }) {
    this.logger.info('Fetching all services');

    const page = options.page || 1;
    const limit = options.limit || 10;

    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .where('service.isActive = :isActive', { isActive: true });

    // Add search condition if query is provided
    if (options.q) {
      queryBuilder.andWhere(
        '(LOWER(service.name) LIKE LOWER(:query) OR LOWER(service.description) LIKE LOWER(:query))',
        { query: `%${options.q}%` },
      );
    }

    queryBuilder
      .orderBy('service.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [services, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / options.limit);

    return {
      data: services,
      meta: {
        page: options.page,
        limit: options.limit,
        totalItems: total,
        totalPages,
        hasNextPage: options.page < totalPages,
        hasPreviousPage: options.page > 1,
      },
    };
  }

  async findAllServicesAdmin(): Promise<Service[]> {
    this.logger.info('Fetching all services for admin');
    return await this.serviceRepository.find({
      relations: ['projects', 'pricingPlans'],
      order: { createdAt: 'DESC' },
    });
  }

  async findServiceById(id: string): Promise<Service> {
    this.logger.info(`Fetching service with ID: ${id}`);
    const service = await this.serviceRepository.findOne({
      where: { id, isActive: true },
      relations: ['projects', 'pricingPlans', 'pricingPlans.features'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    this.logger.info(`Updating service with ID: ${id}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const service = await this.findServiceById(id);

      // Handle icon update if provided
      if (updateServiceDto.icon && updateServiceDto.icon !== service.icon) {
        if (service.iconPublicId) {
          await this.cloudinaryService.deleteFile(service.iconPublicId);
        }
        service.icon = updateServiceDto.icon;
        service.iconPublicId = updateServiceDto.iconPublicId;
      }

      // Handle image update if provided
      if (updateServiceDto.image && updateServiceDto.image !== service.image) {
        if (service.imagePublicId) {
          await this.cloudinaryService.deleteFile(service.imagePublicId);
        }
        service.image = updateServiceDto.image;
        service.imagePublicId = updateServiceDto.imagePublicId;
      }

      // Update and save service
      Object.assign(service, updateServiceDto);
      const updatedService = await queryRunner.manager.save(service);

      await queryRunner.commitTransaction();
      return updatedService;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteService(id: string): Promise<void> {
    this.logger.info(`Deleting service with ID: ${id}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const service = await this.findServiceById(id);

      // Get all projects to clean up their images
      const projects = await this.projectRepository.find({
        where: { serviceId: id },
      });

      // Delete all project images from Cloudinary
      await Promise.all(
        projects.map(async (project) => {
          if (project.mainImagePublicId) {
            await this.cloudinaryService.deleteFile(project.mainImagePublicId);
          }
          if (project.gallery?.length > 0) {
            await Promise.all(
              project.gallery.map((img) =>
                img.public_id
                  ? this.cloudinaryService.deleteFile(img.public_id)
                  : Promise.resolve(),
              ),
            );
          }
        }),
      );

      service.isActive = false;
      await queryRunner.manager.save(service);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Project CRUD
  async createProject(
    serviceId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    this.logger.info(`Creating project: ${createProjectDto.title}`);

    // Verify service exists
    await this.findServiceById(serviceId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Only use URLs and public IDs from DTO
      const { gallery, ...projectDataWithoutFiles } = createProjectDto;
      const projectData: DeepPartial<Project> = {
        ...projectDataWithoutFiles,
        mainImageUrl: createProjectDto.mainImageUrl,
        mainImagePublicId: createProjectDto.mainImagePublicId,
        gallery: gallery || [],
      };

      const project = this.projectRepository.create(projectData);
      const savedProject = await queryRunner.manager.save(Project, project);

      await queryRunner.commitTransaction();
      return savedProject;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findProjectsByService(serviceId: string): Promise<Project[]> {
    this.logger.info(`Fetching projects for service: ${serviceId}`);
    return await this.projectRepository.find({
      where: { serviceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findProjectById(id: string): Promise<Project> {
    this.logger.info(`Fetching project with ID: ${id}`);
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['service'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  // Get all projects for a service
  async getProjects(serviceId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { serviceId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get a single project by its ID
  async getProject(projectId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    this.logger.info(`Updating project with ID: ${id}`);
    const project = await this.findProjectById(id);

    // Remove old main image if new one is sent or set to null
    if (
      (updateProjectDto.mainImageUrl &&
        updateProjectDto.mainImagePublicId !== project.mainImagePublicId) ||
      updateProjectDto.mainImageUrl === null
    ) {
      if (project.mainImagePublicId) {
        await this.cloudinaryService.deleteFile(project.mainImagePublicId);
      }
      project.mainImageUrl = updateProjectDto.mainImageUrl;
      project.mainImagePublicId = updateProjectDto.mainImagePublicId;
    }

    // If gallery is null or empty, delete all gallery images from Cloudinary
    if (
      updateProjectDto.gallery === null ||
      (Array.isArray(updateProjectDto.gallery) &&
        updateProjectDto.gallery.length === 0)
    ) {
      if (project.gallery?.length) {
        for (const img of project.gallery) {
          if (img.public_id) {
            await this.cloudinaryService.deleteFile(img.public_id);
          }
        }
      }
      project.gallery = [];
    } else if (updateProjectDto.gallery) {
      project.gallery = updateProjectDto.gallery;
    }
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async updateProjectForService(
    serviceId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    this.logger.info(
      `Updating project with ID: ${projectId} for service ID: ${serviceId}`,
    );
    // Find the project and validate it belongs to the service
    const project = await this.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.serviceId !== serviceId) {
      throw new BadRequestException(
        'Project does not belong to the specified service',
      );
    }

    // Remove old main image if new one is sent or set to null
    if (
      (updateProjectDto.mainImageUrl &&
        updateProjectDto.mainImagePublicId !== project.mainImagePublicId) ||
      updateProjectDto.mainImageUrl === null
    ) {
      if (project.mainImagePublicId) {
        await this.cloudinaryService.deleteFile(project.mainImagePublicId);
      }
      project.mainImageUrl = updateProjectDto.mainImageUrl;
      project.mainImagePublicId = updateProjectDto.mainImagePublicId;
    }

    // If gallery is null or empty, delete all gallery images from Cloudinary
    if (
      updateProjectDto.gallery === null ||
      (Array.isArray(updateProjectDto.gallery) &&
        updateProjectDto.gallery.length === 0)
    ) {
      if (project.gallery?.length) {
        for (const img of project.gallery) {
          if (img.public_id) {
            await this.cloudinaryService.deleteFile(img.public_id);
          }
        }
      }
      project.gallery = [];
    } else if (updateProjectDto.gallery) {
      project.gallery = updateProjectDto.gallery;
    }
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async deleteProject(id: string): Promise<void> {
    this.logger.info(`Deleting project with ID: ${id}`);
    const project = await this.findProjectById(id);

    // Delete main image if exists
    if (project.mainImagePublicId) {
      await this.cloudinaryService.deleteFile(project.mainImagePublicId);
    }

    // Delete gallery images if exist
    if (project.gallery?.length > 0) {
      for (const img of project.gallery) {
        if (img.public_id) {
          await this.cloudinaryService.deleteFile(img.public_id);
        }
      }
    }

    await this.projectRepository.delete(id);
  }

  async uploadProjectImage(id: string, file: any): Promise<Project> {
    throw new Error('Project image upload is now handled on the frontend.');
  }

  async uploadProjectGalleryImage(id: string, file: any): Promise<Project> {
    throw new Error(
      'Project gallery image upload is now handled on the frontend.',
    );
  }

  async removeProjectGalleryImage(
    projectId: string,
    imageIndex: number,
  ): Promise<Project> {
    const project = await this.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.gallery || imageIndex >= project.gallery.length) {
      throw new NotFoundException('Gallery image not found');
    }

    // Delete image from Cloudinary
    const publicId = project.gallery[imageIndex].public_id;
    if (publicId) {
      await this.cloudinaryService.deleteFile(publicId);
    }

    // Remove from gallery array
    project.gallery = project.gallery.filter(
      (_, index) => index !== imageIndex,
    );

    return this.projectRepository.save(project);
  }

  // Pricing Plan CRUD
  async createPricingPlan(
    createPricingPlanDto: CreatePricingPlanDto,
  ): Promise<PricingPlan> {
    this.logger.info(`Creating pricing plan: ${createPricingPlanDto.name}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify service exists
      await this.findServiceById(createPricingPlanDto.serviceId);

      const planData: DeepPartial<PricingPlan> = {
        serviceId: createPricingPlanDto.serviceId,
        name: createPricingPlanDto.name,
        description: createPricingPlanDto.description,
        originalPrice: createPricingPlanDto.originalPrice,
        finalPrice: createPricingPlanDto.finalPrice,
        billingPeriod: createPricingPlanDto.billingPeriod || 'monthly',
        deliveryDays: createPricingPlanDto.deliveryDays,
        revisions: createPricingPlanDto.revisions,
        isActive: true,
        isPopular: createPricingPlanDto.isPopular,
      };

      // Create and save the pricing plan
      const plan = this.pricingPlanRepository.create(planData);
      const savedPlan = await queryRunner.manager.save(PricingPlan, plan);

      // Create features if provided
      if (createPricingPlanDto.features?.length > 0) {
        const features = createPricingPlanDto.features.map((featureDto) => {
          const featureData: DeepPartial<Feature> = {
            name: featureDto.name,
            description: featureDto.description,
            pricingPlanId: savedPlan.id,
            isIncluded: featureDto.isIncluded ?? true,
            quantity: featureDto.quantity,
          };
          return this.featureRepository.create(featureData);
        });
        await queryRunner.manager.save(Feature, features);
      }

      await queryRunner.commitTransaction();

      // Return the complete plan with features
      return this.findPricingPlanById(savedPlan.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findPricingPlansByService(serviceId: string): Promise<PricingPlan[]> {
    this.logger.info(`Fetching pricing plans for service: ${serviceId}`);

    // First verify that the service exists
    await this.findServiceById(serviceId);

    // Get plans with all relations
    return await this.pricingPlanRepository.find({
      where: { serviceId },
      relations: ['features', 'service'],
      order: { originalPrice: 'ASC' },
    });
  }

  async findPricingPlanById(id: string): Promise<PricingPlan> {
    this.logger.info(`Fetching pricing plan with ID: ${id}`);
    const plan = await this.pricingPlanRepository.findOne({
      where: { id },
      relations: ['service', 'features'],
    });

    if (!plan) {
      throw new NotFoundException(`Pricing plan with ID ${id} not found`);
    }

    return plan;
  }

  async deletePricingPlan(id: string): Promise<void> {
    this.logger.info(`Deleting pricing plan with ID: ${id}`);
    await this.pricingPlanRepository.delete(id);
  }

  // Feature CRUD
  async createFeature(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    this.logger.info(`Creating feature: ${createFeatureDto.name}`);

    // Check if pricing plan exists if pricingPlanId is provided
    if (createFeatureDto.pricingPlanId) {
      const pricingPlan = await this.pricingPlanRepository.findOne({
        where: { id: createFeatureDto.pricingPlanId },
      });

      if (!pricingPlan) {
        throw new NotFoundException(
          `Pricing plan with ID ${createFeatureDto.pricingPlanId} not found`,
        );
      }
    }

    const featureData: DeepPartial<Feature> = {
      ...createFeatureDto,
      isIncluded: createFeatureDto.isIncluded ?? true,
      displayOrder: createFeatureDto.displayOrder ?? 0,
    };

    const feature = this.featureRepository.create(featureData);
    return await this.featureRepository.save(feature);
  }

  async findAllFeatures(): Promise<Feature[]> {
    this.logger.info('Fetching all features');
    return await this.featureRepository.find({
      relations: ['pricingPlan'],
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findFeaturesByPricingPlan(pricingPlanId: string): Promise<Feature[]> {
    this.logger.info(`Fetching features for pricing plan: ${pricingPlanId}`);
    return await this.featureRepository.find({
      where: { pricingPlanId },
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findFeatureById(id: string): Promise<Feature> {
    this.logger.info(`Fetching feature with ID: ${id}`);
    const feature = await this.featureRepository.findOne({
      where: { id },
      relations: ['pricingPlan'],
    });

    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    return feature;
  }

  async updateFeature(
    id: string,
    updateFeatureDto: CreateFeatureDto,
  ): Promise<Feature> {
    this.logger.info(`Updating feature with ID: ${id}`);

    const feature = await this.findFeatureById(id);

    // Check if pricing plan exists if pricingPlanId is provided and different
    if (
      updateFeatureDto.pricingPlanId &&
      updateFeatureDto.pricingPlanId !== feature.pricingPlanId
    ) {
      const pricingPlan = await this.pricingPlanRepository.findOne({
        where: { id: updateFeatureDto.pricingPlanId },
      });

      if (!pricingPlan) {
        throw new NotFoundException(
          `Pricing plan with ID ${updateFeatureDto.pricingPlanId} not found`,
        );
      }
    }

    Object.assign(feature, updateFeatureDto);
    return await this.featureRepository.save(feature);
  }

  async deleteFeature(id: string): Promise<void> {
    this.logger.info(`Deleting feature with ID: ${id}`);
    const feature = await this.findFeatureById(id);
    await this.featureRepository.remove(feature);
  }

  async updatePricingPlan(
    serviceId: string,
    planId: string,
    updatePricingPlanDto: UpdatePricingPlanDto,
  ): Promise<PricingPlan> {
    this.logger.info(
      `Updating pricing plan ${planId} for service ${serviceId}`,
    );

    // Verify service exists
    await this.findServiceById(serviceId);

    // Find the pricing plan
    const plan = await this.pricingPlanRepository.findOne({
      where: { id: planId, serviceId },
      relations: ['features'],
    });

    if (!plan) {
      throw new NotFoundException('Pricing plan not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update basic plan info
      // Prepare plan data with explicit field mapping
      const planData = {
        ...plan,
        name: updatePricingPlanDto.name ?? plan.name,
        description: updatePricingPlanDto.description ?? plan.description,
        originalPrice: updatePricingPlanDto.originalPrice ?? plan.originalPrice,
        finalPrice: updatePricingPlanDto.finalPrice ?? plan.finalPrice,
        billingPeriod: updatePricingPlanDto.billingPeriod ?? plan.billingPeriod,
        deliveryDays: updatePricingPlanDto.deliveryDays ?? plan.deliveryDays,
        revisions: updatePricingPlanDto.revisions ?? plan.revisions,
        isPopular: updatePricingPlanDto.isPopular ?? plan.isPopular,
        serviceId, // Ensure serviceId stays the same
      };

      // Remove features to avoid issues with save
      delete planData.features;
      delete planData.service;

      // Save the updated plan
      const updatedPlan = await queryRunner.manager.save(PricingPlan, plan);

      // Handle features if provided
      if (updatePricingPlanDto.features?.length > 0) {
        // Delete existing features
        await queryRunner.manager.delete(Feature, { pricingPlanId: planId });

        // Create new features
        const features = updatePricingPlanDto.features.map((featureDto) => {
          const featureData: DeepPartial<Feature> = {
            name: featureDto.name,
            description: featureDto.description,
            pricingPlanId: planId,
            isIncluded: true,
            quantity: featureDto.quantity ?? null,
          };
          return this.featureRepository.create(featureData);
        });

        await queryRunner.manager.save(Feature, features);
      }

      await queryRunner.commitTransaction();

      // Return the updated plan with features
      return this.pricingPlanRepository.findOne({
        where: { id: planId },
        relations: ['features'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Contact Form
  async handleContactForm(
    contactFormDto: ContactFormDto,
  ): Promise<{ message: string }> {
    this.logger.info(`Processing contact form from: ${contactFormDto.email}`);

    // Verify service exists
    const service = await this.findServiceById(contactFormDto.serviceId);

    // Here you would typically:
    // 1. Save the contact form submission to database
    // 2. Send email to admin
    // 3. Send confirmation email to user
    // For now, we'll just log it

    this.logger.info(`Contact form submitted for service: ${service.name}`);

    return {
      message: 'Thank you for your inquiry! We will get back to you soon.',
    };
  }
}
