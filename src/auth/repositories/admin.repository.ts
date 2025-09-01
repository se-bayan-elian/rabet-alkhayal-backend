import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../entities/admin.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class AdminRepository extends BaseRepository<Admin> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    dataSource: DataSource,
  ) {
    super(adminRepository, dataSource);
  }

  async findByEmail(email: string): Promise<Admin | undefined> {
    return this.adminRepository.findOne({ where: { email } });
  }

  async save(admin: Admin | Partial<Admin>): Promise<Admin> {
    return this.adminRepository.save(admin);
  }

  async update(id: string, admin: Partial<Admin>): Promise<Admin> {
    await this.adminRepository.update(id, admin);
    return this.adminRepository.findOne({ where: { id } });
  }

  async findAllAdmins(filters?: {
    search?: string;
    isActive?: boolean;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const queryBuilder = this.adminRepository.createQueryBuilder('admin');

    // Apply search filter
    if (filters?.search) {
      queryBuilder.andWhere(
        '(admin.name ILIKE :search OR admin.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply active status filter
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('admin.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    // Apply role filter
    if (filters?.role) {
      queryBuilder.andWhere('admin.role = :role', { role: filters.role });
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.orderBy('admin.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get admin statistics
   */
  async getAdminStats() {
    const [totalAdmins, activeAdmins, inactiveAdmins, verifiedAdmins] =
      await Promise.all([
        this.count(),
        this.count({
          filters: [{ field: 'isActive', operator: 'eq', value: true }],
        }),
        this.count({
          filters: [{ field: 'isActive', operator: 'eq', value: false }],
        }),
        this.count({
          filters: [{ field: 'isVerified', operator: 'eq', value: true }],
        }),
      ]);

    return {
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      verifiedAdmins,
      unverifiedAdmins: totalAdmins - verifiedAdmins,
    };
  }
}
