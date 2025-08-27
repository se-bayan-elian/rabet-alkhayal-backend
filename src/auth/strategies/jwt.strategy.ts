import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  ITokenPayload,
  TokenUserType,
} from '../@types/token-payload.interface';
import { PinoLogger } from 'nestjs-pino';
import { UsersService } from 'src/users/users.service';
import { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly adminRepository: AdminRepository,
    private readonly logger: PinoLogger,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate({ userId, userType }: ITokenPayload) {
    this.logger.debug(`Validating token for ${userType} with id ${userId}`);

    if (userType === TokenUserType.ADMIN) {
      const admin = await this.adminRepository.findOne({
        where: { id: userId },
      });
      if (!admin) throw new UnauthorizedException('Admin not found');
      return admin;
    } else {
      const user = await this.userService.getUser(userId);
      if (!user) throw new UnauthorizedException('User not found');
      return user;
    }
  }
}
