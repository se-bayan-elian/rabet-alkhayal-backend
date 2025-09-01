import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductOption } from './entities/product-option.entity';
import { ProductOptionValue } from './entities/product-option-value.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { ProductOptionsRepository } from './repositories/product-options.repository';
import { ProductOptionValuesRepository } from './repositories/product-option-values.repository';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductOption, ProductOptionValue]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    ProductOptionsRepository,
    ProductOptionValuesRepository,
    CloudinaryService,
  ],
  exports: [
    ProductsService,
    ProductsRepository,
    ProductOptionsRepository,
    ProductOptionValuesRepository,
    CloudinaryService,
    TypeOrmModule,
  ],
})
export class ProductsModule {}
