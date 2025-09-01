import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CategoriesRepository } from './repositories/categories.repository';
import { SubcategoriesRepository } from './repositories/subcategories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { QueryOptionsMapper } from 'src/common';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly subcategoriesRepository: SubcategoriesRepository,
    private readonly logger: PinoLogger,
    private readonly cloudinaryService: CloudinaryService,
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
      description: createCategoryDto.description,
      imageUrl: createCategoryDto.imageUrl,
      imagePublicId: createCategoryDto.imagePublicId,
      iconUrl: createCategoryDto.iconUrl,
      iconPublicId: createCategoryDto.iconPublicId,
    };

    if (createCategoryDto.subcategories?.length) {
      categoryData.subcategories = createCategoryDto.subcategories.map(
        (sub) => ({
          name: sub.name,
          description: sub.description,
          imageUrl: sub.imageUrl,
          imagePublicId: sub.imagePublicId,
          iconUrl: sub.iconUrl,
          iconPublicId: sub.iconPublicId,
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
    // Allow updating image/icon fields
    // Omit subcategories from updateData to match entity type
    // Omit subcategories from updateData
    // Build updateData and omit subcategories
    // Explicitly build updateData with only allowed fields
    const updateData: Partial<Category> = {};
    if (updateCategoryDto.name !== undefined)
      updateData.name = updateCategoryDto.name;
    if (updateCategoryDto.description !== undefined)
      updateData.description = updateCategoryDto.description;
    if (updateCategoryDto.imageUrl !== undefined)
      updateData.imageUrl = updateCategoryDto.imageUrl;
    if (updateCategoryDto.imagePublicId !== undefined)
      updateData.imagePublicId = updateCategoryDto.imagePublicId;
    if (updateCategoryDto.iconUrl !== undefined)
      updateData.iconUrl = updateCategoryDto.iconUrl;
    if (updateCategoryDto.iconPublicId !== undefined)
      updateData.iconPublicId = updateCategoryDto.iconPublicId;

    const updatedCategory = await this.categoriesRepository.updateById(
      id,
      updateData,
    );
    this.logger.info(`Category updated successfully: ${id}`);

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    this.logger.info(`Deleting category with ID: ${id}`);

    // Find the category to get its Cloudinary public IDs
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    // Delete associated images from Cloudinary
    if (category.imagePublicId) {
      try {
        await this.cloudinaryService.deleteFile(category.imagePublicId);
        this.logger.info(
          `Deleted category image from Cloudinary: ${category.imagePublicId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete category image from Cloudinary: ${error.message}`,
        );
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    if (category.iconPublicId) {
      try {
        await this.cloudinaryService.deleteFile(category.iconPublicId);
        this.logger.info(
          `Deleted category icon from Cloudinary: ${category.iconPublicId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete category icon from Cloudinary: ${error.message}`,
        );
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    // Delete the category from database
    await this.categoriesRepository.deleteById(id);
    this.logger.info(`Category deleted successfully: ${id}`);
  }

  async getCategoriesWithStats() {
    this.logger.info('Fetching categories with statistics');
    return this.categoriesRepository.getCategoriesWithProductCount();
  }

  // Subcategory methods
  async createSubcategory(
    categoryId: string,
    name: string,
    description?: string,
    imageUrl?: string,
    imagePublicId?: string,
    iconUrl?: string,
    iconPublicId?: string,
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
      description,
      imageUrl,
      imagePublicId,
      iconUrl,
      iconPublicId,
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

  async updateSubcategory(
    id: string,
    name: string,
    description?: string,
    imageUrl?: string,
    imagePublicId?: string,
    iconUrl?: string,
    iconPublicId?: string,
  ): Promise<Subcategory> {
    this.logger.info(`Updating subcategory with ID: ${id}`);

    const subcategory = await this.subcategoriesRepository.findById(id);
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID '${id}' not found`);
    }

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

    const updateData: any = { name };
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imagePublicId !== undefined) updateData.imagePublicId = imagePublicId;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl;
    if (iconPublicId !== undefined) updateData.iconPublicId = iconPublicId;

    const updatedSubcategory = await this.subcategoriesRepository.updateById(
      id,
      updateData,
    );
    this.logger.info(`Subcategory updated successfully: ${id}`);

    return updatedSubcategory;
  }

  async removeSubcategory(id: string): Promise<void> {
    this.logger.info(`Deleting subcategory with ID: ${id}`);

    const subcategory = await this.subcategoriesRepository.findById(id);
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID '${id}' not found`);
    }

    // Delete associated images from Cloudinary
    if (subcategory.imagePublicId) {
      try {
        await this.cloudinaryService.deleteFile(subcategory.imagePublicId);
        this.logger.info(
          `Deleted subcategory image from Cloudinary: ${subcategory.imagePublicId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete subcategory image from Cloudinary: ${error.message}`,
        );
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    if (subcategory.iconPublicId) {
      try {
        await this.cloudinaryService.deleteFile(subcategory.iconPublicId);
        this.logger.info(
          `Deleted subcategory icon from Cloudinary: ${subcategory.iconPublicId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete subcategory icon from Cloudinary: ${error.message}`,
        );
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    // Delete the subcategory from database
    await this.subcategoriesRepository.deleteById(id);
    this.logger.info(`Subcategory deleted successfully: ${id}`);
  }

  async getSubcategoriesWithStats(categoryId?: string) {
    this.logger.info('Fetching subcategories with statistics');
    return this.subcategoriesRepository.getSubcategoriesWithProductCount(
      categoryId,
    );
  }
}
