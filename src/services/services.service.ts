import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Service } from './entities/service.entity';
import { Project } from './entities/project.entity';
import { PricingPlan } from './entities/pricing-plan.entity';
import { Feature } from './entities/feature.entity';
import { BaseRepository } from '../common/repository/base.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { UpsertPricingPlanDto } from './dto/upsert-pricing-plan.dto';
import { ContactFormDto } from './dto/contact-form.dto';
import { PinoLogger } from 'nestjs-pino';

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
    dataSource: DataSource,
  ) {
    super(serviceRepository, dataSource);
    this.logger.setContext(ServicesService.name);
  }

  // Service CRUD
  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    this.logger.info(`Creating service: ${createServiceDto.nameEn}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the service
      const service = this.serviceRepository.create(createServiceDto);
      const savedService = await queryRunner.manager.save(Service, service);

      // Create projects if provided
      if (createServiceDto.projects?.length > 0) {
        const projects = createServiceDto.projects.map((projectDto) => ({
          ...projectDto,
          serviceId: savedService.id,
        }));
        await queryRunner.manager.save(Project, projects);
      }

      // Create pricing plans and their features if provided
      if (createServiceDto.pricingPlans?.length > 0) {
        for (const planDto of createServiceDto.pricingPlans) {
          // Create the pricing plan
          const plan = await queryRunner.manager.save(PricingPlan, {
            ...planDto,
            serviceId: savedService.id,
          });

          // Create features if provided
          if (
            'features' in planDto &&
            Array.isArray(planDto.features) &&
            planDto.features.length > 0
          ) {
            const features = planDto.features.map((featureDto) => ({
              ...featureDto,
              pricingPlanId: plan.id,
            }));
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

  async findAllServices(
    options: { page: number; limit: number; lang: string } = {
      page: 1,
      limit: 10,
      lang: 'en',
    },
  ) {
    this.logger.info('Fetching all services');

    const [services, total] = await this.serviceRepository.findAndCount({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    const totalPages = Math.ceil(total / options.limit);

    // Transform services to include localized fields
    const localizedServices = services.map((service) => ({
      ...service,
      name: options.lang === 'ar' ? service.nameAr : service.nameEn,
      description:
        options.lang === 'ar' ? service.descriptionAr : service.descriptionEn,
    }));

    return {
      data: localizedServices,
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
    const service = await this.findServiceById(id);
    Object.assign(service, updateServiceDto);
    return await this.serviceRepository.save(service);
  }

  async deleteService(id: string): Promise<void> {
    this.logger.info(`Deleting service with ID: ${id}`);
    const service = await this.findServiceById(id);
    service.isActive = false;
    await this.serviceRepository.save(service);
  }

  // Project CRUD
  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    this.logger.info(`Creating project: ${createProjectDto.title}`);

    // Verify service exists
    await this.findServiceById(createProjectDto.serviceId);

    const project = this.projectRepository.create(createProjectDto);
    return await this.projectRepository.save(project);
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

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    this.logger.info(`Updating project with ID: ${id}`);
    const project = await this.findProjectById(id);
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async deleteProject(id: string): Promise<void> {
    this.logger.info(`Deleting project with ID: ${id}`);
    await this.projectRepository.delete(id);
  }

  // Pricing Plan CRUD
  async createPricingPlan(
    createPricingPlanDto: CreatePricingPlanDto,
  ): Promise<PricingPlan> {
    this.logger.info(`Creating pricing plan: ${createPricingPlanDto.name}`);

    // Verify service exists
    await this.findServiceById(createPricingPlanDto.serviceId);

    const plan = this.pricingPlanRepository.create(createPricingPlanDto);
    return await this.pricingPlanRepository.save(plan);
  }

  async findPricingPlansByService(serviceId: string): Promise<PricingPlan[]> {
    this.logger.info(`Fetching pricing plans for service: ${serviceId}`);
    return await this.pricingPlanRepository.find({
      where: { service: { id: serviceId } },
      relations: ['features'],
      order: { price: 'ASC' },
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

  async updatePricingPlan(
    id: string,
    updatePricingPlanDto: UpdatePricingPlanDto,
  ): Promise<PricingPlan> {
    this.logger.info(`Updating pricing plan with ID: ${id}`);
    const plan = await this.findPricingPlanById(id);
    Object.assign(plan, updatePricingPlanDto);
    return await this.pricingPlanRepository.save(plan);
  }

  async deletePricingPlan(id: string): Promise<void> {
    this.logger.info(`Deleting pricing plan with ID: ${id}`);
    await this.pricingPlanRepository.delete(id);
  }

  async upsertPricingPlan(
    upsertPricingPlanDto: UpsertPricingPlanDto,
  ): Promise<PricingPlan> {
    const { id, features, ...pricingPlanData } = upsertPricingPlanDto;

    this.logger.info(`Upserting pricing plan: ${pricingPlanData.name}`);

    // Verify service exists
    await this.findServiceById(pricingPlanData.serviceId);

    let pricingPlan: PricingPlan;

    if (id) {
      // Update existing pricing plan
      pricingPlan = await this.findPricingPlanById(id);
      Object.assign(pricingPlan, pricingPlanData);
    } else {
      // Create new pricing plan
      pricingPlan = this.pricingPlanRepository.create(pricingPlanData);
    }

    // Save the pricing plan first
    pricingPlan = await this.pricingPlanRepository.save(pricingPlan);

    // Handle features
    if (features && features.length > 0) {
      // Delete existing features if updating
      if (id) {
        await this.featureRepository.delete({ pricingPlanId: pricingPlan.id });
      }

      // Create new features
      const newFeatures = features.map((featureDto) => {
        const feature = this.featureRepository.create({
          ...featureDto,
          pricingPlanId: pricingPlan.id,
        });
        return feature;
      });

      await this.featureRepository.save(newFeatures);
    }

    // Return the pricing plan with features
    return this.findPricingPlanById(pricingPlan.id);
  }

  // Feature CRUD
  async createFeature(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    this.logger.info(`Creating feature: ${createFeatureDto.name}`);
    const feature = this.featureRepository.create(createFeatureDto);
    return await this.featureRepository.save(feature);
  }

  async findAllFeatures(): Promise<Feature[]> {
    this.logger.info('Fetching all features');
    return await this.featureRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findFeatureById(id: string): Promise<Feature> {
    this.logger.info(`Fetching feature with ID: ${id}`);
    const feature = await this.featureRepository.findOne({
      where: { id },
    });

    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    return feature;
  }

  async updateFeature(
    id: string,
    updateFeatureDto: UpdateFeatureDto,
  ): Promise<Feature> {
    this.logger.info(`Updating feature with ID: ${id}`);
    const feature = await this.findFeatureById(id);
    Object.assign(feature, updateFeatureDto);
    return await this.featureRepository.save(feature);
  }

  async deleteFeature(id: string): Promise<void> {
    this.logger.info(`Deleting feature with ID: ${id}`);
    await this.featureRepository.delete(id);
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
