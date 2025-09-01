import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PinoLogger } from 'nestjs-pino';
import { UsersRepository } from './repositories/users.repository';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { QueryOptionsMapper } from '../common/repository/mappers/query-options.mapper';
import { AdminUserFilterDto } from './dto/admin-user-filter.dto';
import { AuthService } from '../auth/auth.service';
import { UserRole } from './dto/create-user.dto';
import { EmailService } from '../emails/email.service';
import {
  VerificationService,
  VerificationType,
} from '../common/redis/verification.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: PinoLogger,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly verificationService: VerificationService,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async createUser(user: CreateUserDto): Promise<User | any> {
    this.logger.info(
      `Creating user with email: ${user.email} and role: ${user.role}`,
    );

    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException(
        `User with email ${user.email} already exists`,
      );
    }

    // If role is admin, create admin instead of user
    if (user.role === UserRole.ADMIN) {
      this.logger.info(`Creating admin user with email: ${user.email}`);

      // Validate password is provided for admin
      if (!user.password) {
        throw new BadRequestException('Password is required for admin role');
      }

      // Create admin using AuthService
      const adminData = {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        password: user.password,
        role: 'super_admin', // Set as super admin as requested
      };

      const createdAdmin = await this.authService.createAdmin(adminData);
      this.logger.info(`Admin created successfully with email: ${user.email}`);

      return {
        message: 'Admin created successfully',
        admin: createdAdmin,
        role: 'super_admin',
      };
    }

    // For customers, create user and send verification email
    this.logger.info(`Creating customer user with email: ${user.email}`);

    const createdUser = await this.usersRepository.create(user);
    this.logger.info(`User created successfully with ID: ${createdUser.id}`);

    // Send verification email for customers
    try {
      const verificationCode = this.generateVerificationCode();
      await this.emailService.sendEmailVerificationCode(
        createdUser.email,
        createdUser.firstName,
        verificationCode,
        60, // 60 minutes expiry
      );

      // Store the verification code in Redis
      await this.verificationService.storeVerificationCode(
        VerificationType.EMAIL_VERIFICATION,
        createdUser.email,
        verificationCode,
        60, // Store for 60 minutes
      );

      this.logger.info(`Verification email sent to: ${createdUser.email}`);
    } catch (emailError) {
      this.logger.error(
        `Failed to send verification email: ${emailError.message}`,
      );
      // Don't fail the user creation if email fails
    }

    return createdUser;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
    this.logger.info('Fetching user and admin statistics');

    const [userStats, adminStats] = await Promise.all([
      this.usersRepository.getUserStats(),
      this.authService.getAdminStats(),
    ]);

    return {
      users: userStats,
      admins: adminStats,
      total: {
        totalUsers: userStats.totalUsers + adminStats.totalAdmins,
        activeUsers: userStats.activeUsers + adminStats.activeAdmins,
        inactiveUsers: userStats.inactiveUsers + adminStats.inactiveAdmins,
        verifiedUsers: userStats.verifiedUsers + adminStats.verifiedAdmins,
        unverifiedUsers:
          userStats.unverifiedUsers + adminStats.unverifiedAdmins,
      },
    };
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

  async getUsersForAdmin(filters: AdminUserFilterDto) {
    this.logger.info(
      'Fetching users and admins for admin with filters:',
      filters,
    );

    // Get users
    const usersResult = await this.usersRepository.findUsersForAdmin({
      search: filters.search,
      isActive: filters.isActive,
      isVerified: filters.isVerified,
      role: filters.role,
      page: filters.page,
      limit: filters.limit,
    });

    // Get admins
    const adminsResult = await this.authService.getAllAdmins({
      search: filters.search,
      isActive: filters.isActive,
      role: filters.role,
      page: filters.page,
      limit: filters.limit,
    });

    // Combine results
    const combinedData = [
      ...usersResult.data.map((user) => ({ ...user, type: 'user' })),
      ...adminsResult.data.map((admin) => ({ ...admin, type: 'admin' })),
    ];

    // Sort by creation date (most recent first)
    combinedData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Apply pagination to combined results
    const total = usersResult.total + adminsResult.total;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedData = combinedData.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async setUserVerificationStatus(
    id: string,
    isVerified: boolean,
  ): Promise<User | any> {
    this.logger.info(
      `Setting verification status for user/admin ${id} to ${isVerified}`,
    );

    // First try to find as user
    let entity: any = await this.usersRepository.findById(id);
    let entityType = 'user';

    if (!entity) {
      // If not found as user, try to find as admin
      entity = await this.authService.getAdminById(id);
      entityType = 'admin';
    }

    if (!entity) {
      throw new NotFoundException(`User/Admin with ID ${id} not found`);
    }

    if (entityType === 'user') {
      const updatedUser = await this.usersRepository.updateById(entity.id, {
        isVerified,
      });
      this.logger.info(
        `User ${id} verification status updated to ${isVerified}`,
      );
      return updatedUser;
    } else {
      // For admins, update verification status
      const updatedAdmin = await this.authService.updateAdmin(entity.id, {
        isVerified,
      });
      this.logger.info(
        `Admin ${id} verification status updated to ${isVerified}`,
      );
      return updatedAdmin;
    }
  }

  async setUserActiveStatus(
    id: string,
    isActive: boolean,
  ): Promise<User | any> {
    this.logger.info(
      `Setting active status for user/admin ${id} to ${isActive}`,
    );

    // First try to find as user
    let entity: any = await this.usersRepository.findById(id);
    let entityType = 'user';

    if (!entity) {
      // If not found as user, try to find as admin
      entity = await this.authService.getAdminById(id);
      entityType = 'admin';
    }

    if (!entity) {
      throw new NotFoundException(`User/Admin with ID ${id} not found`);
    }

    if (entityType === 'user') {
      const updatedUser = await this.usersRepository.updateById(entity.id, {
        isActive,
      });
      this.logger.info(`User ${id} active status updated to ${isActive}`);
      return updatedUser;
    } else {
      const updatedAdmin = await this.authService.updateAdmin(entity.id, {
        isActive,
      });
      this.logger.info(`Admin ${id} active status updated to ${isActive}`);
      return updatedAdmin;
    }
  }

  async resendVerificationCode(id: string) {
    this.logger.info(`Resending verification code for user ${id}`);

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.isVerified) {
      throw new BadRequestException(`User with ID ${id} is already verified`);
    }

    // TODO: Implement email service to resend verification code
    // For now, just log the action
    this.logger.info(`Verification code resent for user ${user.email}`);

    return {
      message: `Verification code has been sent to ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }

  async getAllUsersAndAdmins(filters: AdminUserFilterDto) {
    this.logger.info('Fetching all users and admins with filters:', filters);

    // Get users
    const usersResult = await this.usersRepository.findUsersForAdmin({
      search: filters.search,
      isActive: filters.isActive,
      isVerified: filters.isVerified,
      role: filters.role,
      page: filters.page,
      limit: filters.limit,
    });

    // Get admins
    const adminsResult = await this.authService.getAllAdmins({
      search: filters.search,
      isActive: filters.isActive,
      role: filters.role,
      page: filters.page,
      limit: filters.limit,
    });

    // Combine results
    const combinedData = [
      ...usersResult.data.map((user) => ({ ...user, type: 'user' })),
      ...adminsResult.data.map((admin) => ({ ...admin, type: 'admin' })),
    ];

    // Sort by creation date (most recent first)
    combinedData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Apply pagination to combined results
    const total = usersResult.total + adminsResult.total;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedData = combinedData.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async changeUserRole(id: string, newRole: string): Promise<User | any> {
    this.logger.info(`Changing role for user/admin ${id} to ${newRole}`);

    // First try to find as user
    let entity: any = await this.usersRepository.findById(id);
    let entityType = 'user';

    if (!entity) {
      // If not found as user, try to find as admin
      entity = await this.authService.getAdminById(id);
      entityType = 'admin';
    }

    if (!entity) {
      throw new NotFoundException(`User/Admin with ID ${id} not found`);
    }

    if (entityType === 'user') {
      // For users, role is stored as UserRole enum
      const updatedUser = await this.usersRepository.updateById(entity.id, {
        role: newRole as UserRole,
      });
      this.logger.info(`User ${id} role updated to ${newRole}`);
      return updatedUser;
    } else {
      // For admins, role is stored as string
      const updatedAdmin = await this.authService.updateAdmin(entity.id, {
        role: newRole,
      });
      this.logger.info(`Admin ${id} role updated to ${newRole}`);
      return updatedAdmin;
    }
  }

  async updateUser(
    id: string,
    updatedUser: UpdateUserDto,
    role?: string,
  ): Promise<any> {
    this.logger.info(`Updating user/admin with ID: ${id}`);

    if (role === 'admin' || role === 'super_admin' || role === 'manager') {
      // Update admin
      const admin = await this.authService.getAdminById(id);
      if (!admin) throw new NotFoundException(`Admin with ID ${id} not found`);
      const updatedAdmin = await this.authService.updateAdmin(id, updatedUser);
      this.logger.info(`Admin ${id} updated`);
      return updatedAdmin;
    }

    // Update user
    return this.usersRepository.updateById(id, updatedUser);
  }
}
