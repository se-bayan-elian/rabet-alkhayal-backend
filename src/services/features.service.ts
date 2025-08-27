import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { PinoLogger } from 'nestjs-pino';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { PricingPlan } from './entities/pricing-plan.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(PricingPlan)
    private readonly pricingPlanRepository: Repository<PricingPlan>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(FeaturesService.name);
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
}
