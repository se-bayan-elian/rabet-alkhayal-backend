import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { Project } from './entities/project.entity';
import { PricingPlan } from './entities/pricing-plan.entity';
import { Feature } from './entities/feature.entity';
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Project, PricingPlan, Feature]),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: true,
      },
    }),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
