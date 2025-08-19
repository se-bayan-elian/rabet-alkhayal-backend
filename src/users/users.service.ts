import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PinoLogger } from 'nestjs-pino';
import { UsersRepository } from './repositories/users.repository';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { QueryOptionsMapper } from '../common/repository/mappers/query-options.mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async createUser(user: CreateUserDto): Promise<User> {
    this.logger.info(`Creating user with email: ${user.email}`);

    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException(
        `User with email ${user.email} already exists`,
      );
    }

    const createdUser = await this.usersRepository.create(user);
    this.logger.info(`User created successfully with ID: ${createdUser.id}`);

    return createdUser;
  }

  async findAll(queryOptionsDto: QueryOptionsDto) {
    this.logger.info('Fetching users with pagination and filters');

    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);
    return this.usersRepository.findManyWithPagination(queryOptions);
  }

  async search(searchQuery: string, queryOptionsDto: QueryOptionsDto) {
    this.logger.info(`Searching users with query: ${searchQuery}`);
    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);
    return this.usersRepository.searchUsers(searchQuery, queryOptions);
  }

  async findActiveUsers(queryOptionsDto: QueryOptionsDto) {
    this.logger.info('Fetching active users');
    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);
    return this.usersRepository.findActiveUsers(queryOptions);
  }

  async findByRole(role: string, queryOptionsDto: QueryOptionsDto) {
    this.logger.info(`Fetching users with role: ${role}`);
    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);
    return this.usersRepository.findByRole(role, queryOptions);
  }

  async getUserStats() {
    this.logger.info('Fetching user statistics');
    return this.usersRepository.getUserStats();
  }

  async getUsers() {
    this.logger.info('Fetching all users (legacy method)');
    const result = await this.usersRepository.findManyWithPagination({
      pagination: { page: 1, limit: 100 },
    });
    return result.data;
  }

  async getUser(id: string): Promise<User> {
    this.logger.info(`Fetching user with ID: ${id}`);
    return this.usersRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    this.logger.info(`Fetching user with email: ${email}`);
    return this.usersRepository.findByEmail(email);
  }

  async updateUser(id: number, updatedUser: UpdateUserDto): Promise<User> {
    this.logger.info(`Updating user with ID: ${id}`);
    return this.usersRepository.updateById(id, updatedUser);
  }

  async removeUser(id: number): Promise<void> {
    this.logger.info(`Soft deleting user with ID: ${id}`);
    await this.usersRepository.softDeleteById(id);
  }

  async restore(id: string): Promise<void> {
    this.logger.info(`Restoring user with ID: ${id}`);
    await this.usersRepository.restoreById(id);
  }

  async validateUser(email: string): Promise<User> {
    this.logger.info(`Validating user with email: ${email}`);
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'role', 'isActive'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async verifyUser(email: string) {
    this.logger.info(`Verifying user with email: ${email}`);

    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (user.isVerified) {
      throw new BadRequestException(
        `User with email ${email} is already verified`,
      );
    }

    // Update user's verification status
    const updatedUser = await this.usersRepository.updateById(user.id, {
      isVerified: true,
    });

    this.logger.info(`User ${email} verified successfully`);

    return {
      message: `User with email ${email} has been verified successfully`,
      user: updatedUser,
    };
  }
}
