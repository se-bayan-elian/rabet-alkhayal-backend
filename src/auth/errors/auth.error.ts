import { UnauthorizedException } from '@nestjs/common';

export class TokenNotFoundError extends UnauthorizedException {
  constructor() {
    super({
      message: 'No token provided',
      error: 'TOKEN_NOT_FOUND',
      statusCode: 401,
    });
  }
}

export class TokenExpiredError extends UnauthorizedException {
  constructor() {
    super({
      message: 'Token has expired',
      error: 'TOKEN_EXPIRED',
      statusCode: 401,
    });
  }
}

export class InvalidTokenError extends UnauthorizedException {
  constructor() {
    super({
      message: 'Token is invalid',
      error: 'INVALID_TOKEN',
      statusCode: 401,
    });
  }
}
