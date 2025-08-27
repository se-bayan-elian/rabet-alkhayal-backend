import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ITokenPayload, TokenUserType } from './@types/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigServiceType } from 'src/common/config/config.type';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dtos/sign-up.dto';
import {
  VerificationService,
  VerificationType,
} from 'src/common/redis/verification.service';
import { SignInVerificationDto } from './dtos/sign-in.dto';
import { EmailService } from 'src/emails/email.service';
import { UserRole } from 'src/users/dto/create-user.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRepository } from './repositories/admin.repository';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigServiceType>,
    private readonly logger: PinoLogger,
    private readonly userService: UsersService,
    private readonly verificationService: VerificationService,
    private readonly emailService: EmailService,
    private readonly adminRepository: AdminRepository,
  ) {}

  async adminLogin(
    adminLoginDto: AdminLoginDto,
    response: Response,
  ): Promise<any> {
    this.logger.debug('Admin login attempt:', {
      email: adminLoginDto.email,
      receivedPassword: adminLoginDto.password,
    });

    const admin = await this.adminRepository.findByEmail(adminLoginDto.email);
    if (!admin) {
      this.logger.warn('Admin not found with email:', adminLoginDto.email);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Ensure password is a string
    const password = String(adminLoginDto.password);
    const isPasswordValid = await admin.validatePassword(password);

    this.logger.info(
      'Password validation:' +
        password +
        admin.password +
        {
          receivedPassword: password,
          storedHash: admin.password,
          isValid: isPasswordValid,
        },
    );

    if (!isPasswordValid) {
      this.logger.info('Invalid password for admin:' + adminLoginDto.email);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.isActive) {
      this.logger.warn('Deactivated admin account:', adminLoginDto.email);
      throw new ForbiddenException('Your account has been deactivated');
    }

    // Update last login
    admin.lastLogin = new Date();
    await this.adminRepository.save(admin);

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(admin.id, TokenUserType.ADMIN),
      this.generateRefreshToken(admin.id, TokenUserType.ADMIN),
    ]);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 3600 * 1000, // 30 days
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: 'localhost',
    });

    return {
      accessToken,
    };
  }

  async generateAccessToken(
    userId: string,
    userType: TokenUserType = TokenUserType.USER,
  ): Promise<string> {
    const tokenPayload: ITokenPayload = {
      userId,
      userType,
    };
    return this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    });
  }
  async generateRefreshToken(
    userId: string,
    userType: TokenUserType = TokenUserType.USER,
  ): Promise<string> {
    const tokenPayload: ITokenPayload = {
      userId,
      userType,
    };
    return this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });
  }
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  async login(data: CustomerLoginDto) {
    const user = await this.userService.validateUser(data.email);
    if (!user) {
      throw new Error('Invalid email');
    }
    const code = this.generateVerificationCode();
    await this.verificationService.storeVerificationCode(
      VerificationType.EMAIL_VERIFICATION,
      data.email,
      code,
      15, // Store for 15 minutes
    );
    this.emailService.sendEmailVerificationCode(
      data.email,
      user.firstName,
      code,
      15, // 15 minutes expiry
    );
    return {
      message: 'Verification code sent to your email',
    };
  }
  async verifyLogin(
    signInVerifyData: SignInVerificationDto,
    response: Response,
  ) {
    const isCodeValid = await this.verificationService.verifyCode(
      VerificationType.EMAIL_VERIFICATION,
      signInVerifyData.email,
      signInVerifyData.code,
      true,
    );
    if (!isCodeValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    const user = await this.userService.getUserByEmail(signInVerifyData.email);
    if (!user) {
      throw new Error('Invalid or expired verification code');
    }
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException("Admin Can't login as Customer");
    }
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user.id),
      this.generateRefreshToken(user.id),
    ]);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 3600 * 1000, // 30 days
      secure: true, // Required for cross-origin cookies
      sameSite: 'none', // Required for cross-origin cookies
      path: '/', // Make cookie available on all paths
    });
    return {
      accessToken,
    };
  }

  async refresh(user: User, response: Response) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user.id),
      this.generateRefreshToken(user.id),
    ]);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 3600 * 1000, // 30 days
      secure: true, // Required for cross-origin cookies
      sameSite: 'none', // Required for cross-origin cookies
      path: '/', // Make cookie available on all paths
    });
    return {
      accessToken,
    };
  }
  async logout(response: Response) {
    response.clearCookie('refreshToken', {
      // domain: '.albayancharity.org'
    });
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    // Check if admin with this email already exists
    const existingAdmin = await this.adminRepository.findByEmail(
      createAdminDto.email,
    );
    if (existingAdmin) {
      throw new BadRequestException('Admin with this email already exists');
    }

    // Hash the password manually since we're not using the entity's BeforeInsert hook
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createAdminDto.password, salt);

    // Create and save the admin
    const savedAdmin = await this.adminRepository.save({
      ...createAdminDto,
      password: hashedPassword,
    });

    // Return the admin without the password
    const { password, ...result } = savedAdmin;
    return result;
  }
  async signUp(signUpData: SignUpDto) {
    const user = await this.userService.createUser(signUpData);
    // Generate  a random token and store it in redis for verification
    const verificationCode = this.generateVerificationCode();
    await this.emailService.sendEmailVerificationCode(
      user.email,
      user.firstName,
      verificationCode,
      60, // 60 minutes expiry
    );
    // Store the verification code in Redis with the user's email as the key
    await this.verificationService.storeVerificationCode(
      VerificationType.EMAIL_VERIFICATION,
      user.email,
      verificationCode,
      60, // Store for 60 minutes
    );
    return {
      message:
        'User created successfully. Please check your email for the verification code.',
    };
  }
  async verifyEmail(data: SignInVerificationDto) {
    const isValid = await this.verificationService.verifyCode(
      VerificationType.EMAIL_VERIFICATION,
      data.email,
      data.code,
      true, // Delete after verification
    );
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    // Update user's email verification status in the database
    await this.userService.verifyUser(data.email);
    return {
      message: 'Email verified successfully',
    };
  }
}
