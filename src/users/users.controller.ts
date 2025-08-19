import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/helpers/enums';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { PaginatedResponseDto } from '../common/repository/dto/paginated-response.dto';

@ApiTags('users')
@ApiBearerAuth('Authorization') // Must match the name in DocumentBuilder
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: User,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users with advanced filtering, sorting, and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: PaginatedResponseDto<User>,
  })
  @ApiQuery({
    name: 'pagination',
    required: false,
    description: 'Pagination options: {"page": 1, "limit": 10}',
    example: '{"page": 1, "limit": 10}',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort options: [{"field": "createdAt", "direction": "DESC"}]',
    example: '[{"field": "createdAt", "direction": "DESC"}]',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description:
      'Filter options: [{"field": "isActive", "operator": "eq", "value": true}]',
    example: '[{"field": "isActive", "operator": "eq", "value": true}]',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Search options: {"query": "john", "fields": ["firstName", "lastName", "email"]}',
    example: '{"query": "john", "fields": ["firstName", "lastName", "email"]}',
  })
  @ApiQuery({
    name: 'relations',
    required: false,
    description: 'Relations to include',
    example: '[]',
  })
  findAll(@Query() queryOptionsDto: QueryOptionsDto) {
    return this.usersService.findAll(queryOptionsDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
    type: PaginatedResponseDto<User>,
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query',
    example: 'john doe',
  })
  search(
    @Query('q') searchQuery: string,
    @Query() queryOptionsDto: QueryOptionsDto,
  ) {
    return this.usersService.search(searchQuery, queryOptionsDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active users retrieved successfully',
    type: PaginatedResponseDto<User>,
  })
  findActiveUsers(@Query() queryOptionsDto: QueryOptionsDto) {
    return this.usersService.findActiveUsers(queryOptionsDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User statistics retrieved successfully',
  })
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users by role retrieved successfully',
    type: PaginatedResponseDto<User>,
  })
  findByRole(
    @Param('role') role: string,
    @Query() queryOptionsDto: QueryOptionsDto,
  ) {
    return this.usersService.findByRole(role, queryOptionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  remove(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore soft deleted user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User restored successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }
}
