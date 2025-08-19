import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { CategoriesRepository } from './repositories/categories.repository';
import { SubcategoriesRepository } from './repositories/subcategories.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Subcategory])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, SubcategoriesRepository],
  exports: [
    CategoriesService,
    CategoriesRepository,
    SubcategoriesRepository,
    TypeOrmModule,
  ],
})
export class CategoriesModule {}
