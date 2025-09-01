import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.stategy';
import { GoogleOAuthService } from './googleoAuthService';
import { EmailModule } from 'src/emails/email.module';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './repositories/admin.repository';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [
    JwtModule,
    EmailModule,
    TypeOrmModule.forFeature([Admin]),
    forwardRef(() => UsersModule),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GoogleOAuthService,
    JwtStrategy,
    JwtAuthGuard,
    AdminRepository,
  ],
  exports: [JwtAuthGuard, AdminRepository, AuthService],
})
export class AuthModule {}
