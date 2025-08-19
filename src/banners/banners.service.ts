import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner, IntegrationType } from './entities/banner.entity';

interface FindAllFilters {
  isActive?: boolean;
  integrationType?: IntegrationType;
  search?: string;
}

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BannersService.name);
  }

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    this.logger.info(`Creating banner: ${createBannerDto.title}`);

    // Validate integration type and corresponding ID
    this.validateIntegrationData(createBannerDto);

    // Validate dates if provided
    if (createBannerDto.startDate && createBannerDto.endDate) {
      const startDate = new Date(createBannerDto.startDate);
      const endDate = new Date(createBannerDto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const bannerData = { ...createBannerDto };
    
    // Convert date strings to Date objects
    if (bannerData.startDate) {
      bannerData.startDate = new Date(bannerData.startDate) as any;
    }
    if (bannerData.endDate) {
      bannerData.endDate = new Date(bannerData.endDate) as any;
    }

    const banner = this.bannerRepository.create(bannerData);
    return this.bannerRepository.save(banner);
  }

  async findAll(filters: FindAllFilters = {}): Promise<Banner[]> {
    this.logger.info('Fetching all banners with filters:', filters);

    const queryBuilder = this.bannerRepository.createQueryBuilder('banner');

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('banner.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.integrationType) {
      queryBuilder.andWhere('banner.integrationType = :integrationType', {
        integrationType: filters.integrationType,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(banner.title ILIKE :search OR banner.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('banner.displayOrder', 'ASC').addOrderBy('banner.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async getActiveBanners(limit?: number): Promise<Banner[]> {
    this.logger.info(`Fetching active banners with limit: ${limit}`);

    const queryBuilder = this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.isActive = true');

    // Filter by schedule if dates are set
    const now = new Date();
    queryBuilder
      .andWhere('(banner.startDate IS NULL OR banner.startDate <= :now)', { now })
      .andWhere('(banner.endDate IS NULL OR banner.endDate > :now)', { now });

    queryBuilder.orderBy('banner.displayOrder', 'ASC').addOrderBy('banner.createdAt', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Banner> {
    this.logger.info(`Fetching banner with ID: ${id}`);

    const banner = await this.bannerRepository.findOne({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    this.logger.info(`Updating banner with ID: ${id}`);

    const banner = await this.findOne(id);

    // Validate integration type and corresponding ID if provided
    if (updateBannerDto.integrationType || this.hasIntegrationFields(updateBannerDto)) {
      const mergedData = { ...banner, ...updateBannerDto };
      this.validateIntegrationData(mergedData);
    }

    // Validate dates if provided
    if (updateBannerDto.startDate || updateBannerDto.endDate) {
      const startDate = updateBannerDto.startDate 
        ? new Date(updateBannerDto.startDate) 
        : banner.startDate;
      const endDate = updateBannerDto.endDate 
        ? new Date(updateBannerDto.endDate) 
        : banner.endDate;

      if (startDate && endDate && endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Convert date strings to Date objects
    const updateData = { ...updateBannerDto };
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate) as any;
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate) as any;
    }

    Object.assign(banner, updateData);
    return this.bannerRepository.save(banner);
  }

  async remove(id: string): Promise<void> {
    this.logger.info(`Deleting banner with ID: ${id}`);

    const result = await this.bannerRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
  }

  async recordView(id: string): Promise<void> {
    this.logger.info(`Recording view for banner: ${id}`);

    await this.bannerRepository.increment({ id }, 'viewCount', 1);
  }

  async recordClick(id: string): Promise<void> {
    this.logger.info(`Recording click for banner: ${id}`);

    await this.bannerRepository.increment({ id }, 'clickCount', 1);
  }

  async updateDisplayOrder(id: string, displayOrder: number): Promise<Banner> {
    this.logger.info(`Updating display order for banner ${id} to ${displayOrder}`);

    const banner = await this.findOne(id);
    banner.displayOrder = displayOrder;
    
    return this.bannerRepository.save(banner);
  }

  async getBannerStats(id: string) {
    this.logger.info(`Fetching banner statistics for ID: ${id}`);

    const banner = await this.findOne(id);

    const daysActive = banner.createdAt 
      ? Math.ceil((new Date().getTime() - banner.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const stats = {
      viewCount: banner.viewCount,
      clickCount: banner.clickCount,
      clickThroughRate: banner.clickThroughRate,
      isScheduled: banner.isScheduled,
      daysActive,
      averageViewsPerDay: daysActive > 0 ? banner.viewCount / daysActive : 0,
      averageClicksPerDay: daysActive > 0 ? banner.clickCount / daysActive : 0,
    };

    return stats;
  }

  private validateIntegrationData(data: any): void {
    const { integrationType, productId, categoryId, subcategoryId, serviceId, externalUrl } = data;

    switch (integrationType) {
      case IntegrationType.PRODUCT:
        if (!productId) {
          throw new BadRequestException('Product ID is required for product integration type');
        }
        break;
      case IntegrationType.CATEGORY:
        if (!categoryId) {
          throw new BadRequestException('Category ID is required for category integration type');
        }
        break;
      case IntegrationType.SUBCATEGORY:
        if (!subcategoryId) {
          throw new BadRequestException('Subcategory ID is required for subcategory integration type');
        }
        break;
      case IntegrationType.SERVICE:
        if (!serviceId) {
          throw new BadRequestException('Service ID is required for service integration type');
        }
        break;
      case IntegrationType.EXTERNAL_URL:
        if (!externalUrl) {
          throw new BadRequestException('External URL is required for external URL integration type');
        }
        break;
      default:
        throw new BadRequestException('Invalid integration type');
    }
  }

  private hasIntegrationFields(data: any): boolean {
    return !!(data.productId || data.categoryId || data.subcategoryId || data.serviceId || data.externalUrl);
  }
}
