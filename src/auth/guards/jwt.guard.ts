import { Global, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from '@nestjs/common';
import {
  InvalidTokenError,
  TokenExpiredError,
  TokenNotFoundError,
} from '../errors/auth.error';

@Global()
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: Error | any) {
    if (info instanceof Error) {
      this.logger.error(`JWT Error detected: ${info.name}`);

      if (info.name === 'TokenExpiredError') {
        this.logger.error('Token expired');
        throw new TokenExpiredError();
      }

      if (info.name === 'JsonWebTokenError') {
        throw new TokenNotFoundError();
      }
    }

    // Check for other errors
    if (err) {
      this.logger.error('Authentication error:', err);
      throw new InvalidTokenError();
    }

    // Check for missing user
    if (!user) {
      this.logger.error('No user found in request');
      throw new TokenNotFoundError();
    }
    return user;
  }
}
