import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { Project } from './entities/project.entity';
import { PricingPlan } from './entities/pricing-plan.entity';
import { Feature } from './entities/feature.entity';
import { CloudinaryModule } from '../common/modules/cloudinary.module';
import { PricingPlansService } from './pricing-plan.service';
import { ProjectsService } from './projects.service';
import { FeaturesService } from './features.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Project, PricingPlan, Feature]),
    CloudinaryModule,
  ],
  controllers: [ServicesController],
  providers: [
    ServicesService,
    PricingPlansService,
    ProjectsService,
    FeaturesService,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
