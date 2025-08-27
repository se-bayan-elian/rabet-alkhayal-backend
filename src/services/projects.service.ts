import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Service } from './entities/service.entity';
import { PinoLogger } from 'nestjs-pino';
import { CreateProjectDto } from './dto/create-project.dto';
import { ServicesService } from './services.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CloudinaryService } from 'src/common/services/cloudinary.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly logger: PinoLogger,
    private servicesService: ServicesService,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.logger.setContext(ProjectsService.name);
  }
  // Project CRUD
  async createProject(
    serviceId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    this.logger.info(`Creating project: ${createProjectDto.title}`);

    // Verify service exists
    await this.servicesService.findServiceById(serviceId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = this.projectsRepository.create(createProjectDto);
      const savedProject = await queryRunner.manager.save(Project, project);

      await queryRunner.commitTransaction();
      return savedProject;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findProjectsByService(serviceId: string): Promise<Project[]> {
    this.logger.info(`Fetching projects for service: ${serviceId}`);
    return await this.projectsRepository.find({
      where: { serviceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findProjectById(id: string): Promise<Project> {
    this.logger.info(`Fetching project with ID: ${id}`);
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['service'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  // Get all projects for a service
  async getProjects(serviceId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { serviceId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get a single project by its ID
  async getProject(projectId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    this.logger.info(`Updating project with ID: ${id}`);
    const project = await this.findProjectById(id);
    Object.assign(project, updateProjectDto);
    return await this.projectsRepository.save(project);
  }

  async updateProjectForService(
    serviceId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    this.logger.info(
      `Updating project with ID: ${projectId} for service ID: ${serviceId}`,
    );
    // Find the project and validate it belongs to the service
    const project = await this.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.serviceId !== serviceId) {
      throw new BadRequestException(
        'Project does not belong to the specified service',
      );
    }
    Object.assign(project, updateProjectDto);
    return await this.projectsRepository.save(project);
  }

  async deleteProject(id: string): Promise<void> {
    this.logger.info(`Deleting project with ID: ${id}`);
    const project = await this.findProjectById(id);

    // Delete main image if exists
    if (project.mainImagePublicId) {
      await this.cloudinaryService.deleteFile(project.mainImagePublicId);
    }

    // Delete gallery images if exist
    if (project.gallery?.length > 0) {
      for (const gallery of project.gallery) {
        await this.cloudinaryService.deleteFile(gallery.public_id);
      }
    }

    await this.projectsRepository.delete(id);
  }
}
