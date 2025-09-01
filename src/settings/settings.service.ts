import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
import { UpdateDeliveryCostsDto } from './dto/update-delivery-costs.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  // Get or create settings (singleton pattern)
  private async getSettings(): Promise<Settings> {
    let settings = await this.settingsRepository.findOne({
      where: {},
    });

    if (!settings) {
      settings = this.settingsRepository.create();
      await this.settingsRepository.save(settings);
    }

    return settings;
  }

  // Social Media Links
  async getSocialLinks(): Promise<UpdateSocialLinksDto> {
    const settings = await this.getSettings();
    return {
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      twitterUrl: settings.twitterUrl,
      linkedinUrl: settings.linkedinUrl,
      youtubeUrl: settings.youtubeUrl,
      whatsappNumber: settings.whatsappNumber,
      telegramUrl: settings.telegramUrl,
      tiktokUrl: settings.tiktokUrl,
      snapchatUrl: settings.snapchatUrl,
    };
  }

  async updateSocialLinks(
    updateSocialLinksDto: UpdateSocialLinksDto,
  ): Promise<UpdateSocialLinksDto> {
    const settings = await this.getSettings();

    Object.assign(settings, updateSocialLinksDto);
    await this.settingsRepository.save(settings);

    return this.getSocialLinks();
  }

  // Delivery Costs
  async getDeliveryCosts(): Promise<UpdateDeliveryCostsDto> {
    const settings = await this.getSettings();
    return {
      deliveryCosts: settings.deliveryCosts || [],
    };
  }

  async updateDeliveryCosts(
    updateDeliveryCostsDto: UpdateDeliveryCostsDto,
  ): Promise<UpdateDeliveryCostsDto> {
    const settings = await this.getSettings();

    settings.deliveryCosts = updateDeliveryCostsDto.deliveryCosts;
    await this.settingsRepository.save(settings);

    return this.getDeliveryCosts();
  }

  // Get all settings
  async getAllSettings(): Promise<Settings> {
    return this.getSettings();
  }
}
