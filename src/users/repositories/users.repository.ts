import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { QueryOptions } from '../../common/repository/interfaces/query-options.interface';

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
          filters: [{ field: 'isEmailVerified', operator: 'eq', value: true }],
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
}
