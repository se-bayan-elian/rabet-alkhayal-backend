import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ITokenPayload } from '../@types/token-payload.interface';
import { PinoLogger } from 'nestjs-pino';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly logger: PinoLogger,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request.cookies?.refreshToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
    });
  }
  async validate({ userId }: ITokenPayload) {
    return this.userService.getUser(userId);
  }
}
