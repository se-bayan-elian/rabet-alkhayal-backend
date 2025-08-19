import { Injectable, BadRequestException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CategoriesRepository } from './repositories/categories.repository';
import { SubcategoriesRepository } from './repositories/subcategories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { QueryOptionsMapper } from '../common/repository/mappers/query-options.mapper';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly subcategoriesRepository: SubcategoriesRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(CategoriesService.name);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.info(`Creating category: ${createCategoryDto.name}`);

    // Check if category name already exists
    const existingCategory = await this.categoriesRepository.findByName(
      createCategoryDto.name,
    );
    if (existingCategory) {
      throw new BadRequestException(
        `Category with name '${createCategoryDto.name}' already exists`,
      );
    }

    // Create category with subcategories
    const categoryData: any = {
      name: createCategoryDto.name,
    };

    if (createCategoryDto.subcategories?.length) {
      categoryData.subcategories = createCategoryDto.subcategories.map(
        (sub) => ({
          name: sub.name,
        }),
      );
    }

    const category = await this.categoriesRepository.create(categoryData);
    this.logger.info(`Category created successfully with ID: ${category.id}`);

    return category;
  }

  async findAll(queryOptionsDto: QueryOptionsDto) {
    this.logger.info('Fetching categories with subcategories');
    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);
    return this.categoriesRepository.findWithSubcategories(queryOptions);
  }

  async findOne(id: string): Promise<Category> {
    this.logger.info(`Fetching category with ID: ${id}`);
    return this.categoriesRepository.findById(id, {
      relations: ['subcategories'],
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    this.logger.info(`Updating category with ID: ${id}`);

    // Check if category exists
    const category = await this.categoriesRepository.findById(id);

    // Check if new name conflicts with existing categories
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const nameExists = await this.categoriesRepository.nameExists(
        updateCategoryDto.name,
        id,
      );
      if (nameExists) {
        throw new BadRequestException(
          `Category with name '${updateCategoryDto.name}' already exists`,
        );
      }
    }

    // Extract only category fields, exclude subcategories
    const { subcategories, ...categoryData } = updateCategoryDto;

    const updatedCategory = await this.categoriesRepository.updateById(
      id,
      categoryData,
    );
    this.logger.info(`Category updated successfully: ${id}`);

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    this.logger.info(`Soft deleting category with ID: ${id}`);
    await this.categoriesRepository.softDeleteById(id);
  }

  async restore(id: string): Promise<void> {
    this.logger.info(`Restoring category with ID: ${id}`);
    await this.categoriesRepository.restoreById(id);
  }

  async getCategoriesWithStats() {
    this.logger.info('Fetching categories with statistics');
    return this.categoriesRepository.getCategoriesWithProductCount();
  }

  // Subcategory methods
  async createSubcategory(
    categoryId: string,
    name: string,
  ): Promise<Subcategory> {
    this.logger.info(
      `Creating subcategory '${name}' for category: ${categoryId}`,
    );

    // Check if category exists
    await this.categoriesRepository.findById(categoryId);

    // Check if subcategory name exists in this category
    const existingSubcategory =
      await this.subcategoriesRepository.findByNameInCategory(name, categoryId);
    if (existingSubcategory) {
      throw new BadRequestException(
        `Subcategory with name '${name}' already exists in this category`,
      );
    }

    const subcategory = await this.subcategoriesRepository.create({
      name,
      categoryId,
    });

    this.logger.info(
      `Subcategory created successfully with ID: ${subcategory.id}`,
    );
    return subcategory;
  }

  async getSubcategories(categoryId: string, queryOptionsDto: QueryOptionsDto) {
    this.logger.info(`Fetching subcategories for category: ${categoryId}`);
    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);
    return this.subcategoriesRepository.findByCategoryId(
      categoryId,
      queryOptions,
    );
  }

  async updateSubcategory(id: string, name: string): Promise<Subcategory> {
    this.logger.info(`Updating subcategory with ID: ${id}`);

    const subcategory = await this.subcategoriesRepository.findById(id);

    // Check if new name conflicts within the same category
    if (name !== subcategory.name) {
      const nameExists =
        await this.subcategoriesRepository.nameExistsInCategory(
          name,
          subcategory.categoryId,
          id,
        );
      if (nameExists) {
        throw new BadRequestException(
          `Subcategory with name '${name}' already exists in this category`,
        );
      }
    }

    const updatedSubcategory = await this.subcategoriesRepository.updateById(
      id,
      { name },
    );
    this.logger.info(`Subcategory updated successfully: ${id}`);

    return updatedSubcategory;
  }

  async removeSubcategory(id: string): Promise<void> {
    this.logger.info(`Soft deleting subcategory with ID: ${id}`);
    await this.subcategoriesRepository.softDeleteById(id);
  }

  async getSubcategoriesWithStats(categoryId?: string) {
    this.logger.info('Fetching subcategories with statistics');
    return this.subcategoriesRepository.getSubcategoriesWithProductCount(
      categoryId,
    );
  }
}
