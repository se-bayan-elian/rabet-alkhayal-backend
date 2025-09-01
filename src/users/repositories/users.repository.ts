import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { QueryOptions } from '../../common/repository/interfaces/query-options.interface';
import { UserRole } from '../dto/create-user.dto';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    dataSource: DataSource,
  ) {
    super(userRepository, dataSource);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  /**
   * Find active users with pagination and filters
   */
  async findActiveUsers(queryOptions?: QueryOptions<User>) {
    const options: QueryOptions<User> = {
      ...queryOptions,
      filters: [
        ...(queryOptions?.filters || []),
        { field: 'isActive', operator: 'eq', value: true },
      ],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Search users by name or email
   */
  async searchUsers(searchQuery: string, queryOptions?: QueryOptions<User>) {
    const options: QueryOptions<User> = {
      ...queryOptions,
      search: {
        query: searchQuery,
        fields: ['firstName', 'lastName', 'email', 'username'],
        operator: 'OR',
      },
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Find users by role
   */
  async findByRole(role: string, queryOptions?: QueryOptions<User>) {
    const options: QueryOptions<User> = {
      ...queryOptions,
      filters: [
        ...(queryOptions?.filters || []),
        { field: 'role', operator: 'eq', value: role },
      ],
    };

    return this.findManyWithPagination(options);
  }

  /**
   * Check if email exists
   */
  async emailExists(
    email: string,
    excludeId?: string | number,
  ): Promise<boolean> {
    const queryBuilder = this.createQueryBuilder('user').where(
      'user.email = :email',
      { email },
    );

    if (excludeId) {
      queryBuilder.andWhere('user.id != :id', { id: excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Check if username exists
   */
  async usernameExists(
    username: string,
    excludeId?: string | number,
  ): Promise<boolean> {
    const queryBuilder = this.createQueryBuilder('user').where(
      'user.username = :username',
      { username },
    );

    if (excludeId) {
      queryBuilder.andWhere('user.id != :id', { id: excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const [totalUsers, activeUsers, inactiveUsers, verifiedUsers] =
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
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
    };
  }

  /**
   * Find users for admin with advanced filters
   */
  async findUsersForAdmin(filters: {
    search?: string;
    isActive?: boolean;
    isVerified?: boolean;
    role?: UserRole;
    page?: number;
    limit?: number;
  }) {
    const queryBuilder = this.createQueryBuilder('user');

    // Apply search filter
    if (filters.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply active status filter
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    // Apply verified status filter
    if (filters.isVerified !== undefined) {
      queryBuilder.andWhere('user.isVerified = :isVerified', {
        isVerified: filters.isVerified,
      });
    }

    // Apply role filter
    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.orderBy('user.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
