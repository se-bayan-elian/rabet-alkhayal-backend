import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConfigServiceType } from '../config/config.type';

export enum JWTTypes {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}
type jwtConfigType = {
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRATION: string;
};

@Injectable()
export class TokenUtil {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigServiceType>,
  ) {}
  generateAccessToken(userId: string) {
    const token = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
      },
    );
    return token;
  }
  generateRefreshToken(userId: string, isPersistent: boolean = false) {
    const token = this.jwtService.sign(
      { userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: isPersistent
          ? this.configService.get('JWT_REFRESH_PERSISTENT_EXPIRATION')
          : this.configService.get('JWT_REFRESH_EXPIRATION'),
      },
    );
    return token;
  }
  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
  verifyToken(token: string, type: JWTTypes) {
    return this.jwtService.verify(token, {
      secret:
        type === JWTTypes.REFRESH
          ? process.env.JWT_REFRESH_SECRET
          : process.env.JWT_ACCESS_SECRET,
    });
  }
}
