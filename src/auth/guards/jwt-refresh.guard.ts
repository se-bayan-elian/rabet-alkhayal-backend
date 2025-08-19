import { AuthGuard } from '@nestjs/passport';
import {
  InvalidTokenError,
  TokenExpiredError,
  TokenNotFoundError,
} from '../errors/auth.error';

export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any, info: Error | any) {
    // This catches errors before they reach validate()
    if (info instanceof Error) {
      if (info.name === 'JsonWebTokenError') {
        throw new InvalidTokenError();
      }
      if (info.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      }
      if (info.name === 'NotBeforeError') {
        throw new InvalidTokenError();
      }
      if (info.message === 'No auth token') {
        throw new TokenNotFoundError();
      }
    }
    return user;
  }
}
