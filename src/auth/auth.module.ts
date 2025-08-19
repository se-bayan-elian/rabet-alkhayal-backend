import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from 'src/users/users.module';
import { GoogleStrategy } from './strategies/google.stategy';
import { VerificationService } from 'src/common/redis/verification.service';
import { GoogleOAuthService } from './googleoAuthService';
import { EmailModule } from 'src/emails/email.module';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './repositories/admin.repository';

@Module({
  imports: [
    JwtModule,
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([Admin]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtRefreshStrategy,
    VerificationService,
    GoogleStrategy,
    GoogleOAuthService,
    JwtStrategy,
    JwtAuthGuard,
    AdminRepository,
  ],
  exports: [JwtAuthGuard, AdminRepository],
})
export class AuthModule {}
