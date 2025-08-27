import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { PricingPlan } from './entities/pricing-plan.entity';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { ServicesService } from './services.service';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';

@Injectable()
export class PricingPlansService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(PricingPlan)
    private readonly pricingPlanRepository: Repository<PricingPlan>,
    private readonly logger: PinoLogger,
    private readonly servicesService: ServicesService,
    private readonly dataSource: DataSource,
  ) {
    this.logger.setContext(PricingPlansService.name);
  }
  async createPricingPlan(pricingPlanDto: CreatePricingPlanDto) {
    const pricingPlan = this.pricingPlanRepository.create(pricingPlanDto);
    await this.pricingPlanRepository.save(pricingPlan);
    return pricingPlan;
  }
  async findPricingPlansByService(serviceId: string): Promise<PricingPlan[]> {
    this.logger.info(`Fetching pricing plans for service: ${serviceId}`);

    // First verify that the service exists
    await this.servicesService.findServiceById(serviceId);

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

  async updatePricingPlan(
    serviceId: string,
    planId: string,
    updatePricingPlanDto: UpdatePricingPlanDto,
  ): Promise<PricingPlan> {
    this.logger.info(
      `Updating pricing plan ${planId} for service ${serviceId}`,
    );

    // Verify service exists
    await this.servicesService.findServiceById(serviceId);

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
      await queryRunner.manager.save(PricingPlan, plan);

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
}
