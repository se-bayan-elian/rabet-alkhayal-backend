import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductOptionValue } from '../entities/product-option-value.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class ProductOptionValuesRepository extends BaseRepository<ProductOptionValue> {
  constructor(
    @InjectRepository(ProductOptionValue)
    private readonly productOptionValueRepository: Repository<ProductOptionValue>,
    dataSource: DataSource,
  ) {
    super(productOptionValueRepository, dataSource);
  }

  /**
   * Find values by option ID
   */
  async findByOptionId(optionId: string): Promise<ProductOptionValue[]> {
    return this.findMany({
      filters: [{ field: 'optionId', operator: 'eq', value: optionId }],
      sort: [{ field: 'value', direction: 'ASC' }],
    });
  }

  /**
   * Find values with extra price
   */
  async findWithExtraPrice(): Promise<ProductOptionValue[]> {
    return this.findMany({
      filters: [{ field: 'extraPrice', operator: 'gt', value: 0 }],
    });
  }
}
