import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { PinoLogger } from 'nestjs-pino';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOAuthService } from './googleoAuthService';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { SignInVerificationDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: PinoLogger,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}
  @Post('admin/create')
  @ApiOperation({
    summary: 'Create new admin (Temporary endpoint)',
    description:
      'Creates a new administrator account with the specified details',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.createAdmin(createAdminDto);
  }

  @Post('admin/login')
  @ApiOperation({
    summary: 'Admin login endpoint',
    description: 'Login endpoint for administrators',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin logged in successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        admin: { $ref: '#/components/schemas/Admin' },
      },
    },
  })
  async adminLogin(
    @Body() body: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.adminLogin(body, response);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Customer login endpoint',
    description: 'Login endpoint for customers',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer logged in successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  async login(@Body() body: CustomerLoginDto) {
    return this.authService.login(body);
  }
  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('sign-up-verification')
  async signUpVerify(@Body() body: SignInVerificationDto) {
    return this.authService.verifyEmail(body);
  }

  @Post('verify-login')
  async verifyLogin(
    @Body() data: SignInVerificationDto,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.verifyLogin(data, response);
  }
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refreshToken(
    @CurrentUser() user: User,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.refresh(user, response);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    this.authService.logout(response);
  }
  @Get('google/url')
  getGoogleAuthUrl() {
    const url = this.googleOAuthService.getAuthUrl();
    return { url };
  }
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    const { user } = req;
    const [accessToken, refreshToken] = await Promise.all([
      this.authService.generateAccessToken(user.id),
      this.authService.generateRefreshToken(user.id),
    ]);
    return { accessToken, refreshToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: User,
  })
  getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
    type: User,
  })
  updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, updateData);
  }
}
