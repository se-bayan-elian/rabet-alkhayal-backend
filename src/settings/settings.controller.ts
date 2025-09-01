import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SettingsService } from './settings.service';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
import { UpdateDeliveryCostsDto } from './dto/update-delivery-costs.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/helpers/enums';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SuperAdmin)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Social Media Routes
  @Get('social')
  @ApiOperation({ summary: 'Get social media links' })
  @ApiResponse({
    status: 200,
    description: 'Social media links retrieved successfully',
  })
  async getSocialLinks(): Promise<UpdateSocialLinksDto> {
    return this.settingsService.getSocialLinks();
  }

  @Put('social')
  @ApiOperation({ summary: 'Update social media links' })
  @ApiResponse({
    status: 200,
    description: 'Social media links updated successfully',
  })
  async updateSocialLinks(
    @Body() updateSocialLinksDto: UpdateSocialLinksDto,
  ): Promise<UpdateSocialLinksDto> {
    return this.settingsService.updateSocialLinks(updateSocialLinksDto);
  }

  // Delivery Costs Routes
  @Get('delivery')
  @ApiOperation({ summary: 'Get delivery costs' })
  @ApiResponse({
    status: 200,
    description: 'Delivery costs retrieved successfully',
  })
  async getDeliveryCosts(): Promise<UpdateDeliveryCostsDto> {
    return this.settingsService.getDeliveryCosts();
  }

  @Put('delivery')
  @ApiOperation({ summary: 'Update delivery costs' })
  @ApiResponse({
    status: 200,
    description: 'Delivery costs updated successfully',
  })
  async updateDeliveryCosts(
    @Body() updateDeliveryCostsDto: UpdateDeliveryCostsDto,
  ): Promise<UpdateDeliveryCostsDto> {
    return this.settingsService.updateDeliveryCosts(updateDeliveryCostsDto);
  }

  // General Settings Routes
  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({
    status: 200,
    description: 'All settings retrieved successfully',
  })
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }
}
