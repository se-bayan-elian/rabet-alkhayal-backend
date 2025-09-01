import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SubcategoriesController } from './subcategories.controller';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { CategoriesRepository } from './repositories/categories.repository';
import { SubcategoriesRepository } from './repositories/subcategories.repository';
import { CloudinaryService } from 'src/common/services/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Subcategory])],
  controllers: [CategoriesController, SubcategoriesController],
  providers: [
    CategoriesService,
    CategoriesRepository,
    SubcategoriesRepository,
    CloudinaryService,
  ],
  exports: [
    CategoriesService,
    CategoriesRepository,
    SubcategoriesRepository,
    TypeOrmModule,
  ],
})
export class CategoriesModule {}
