/* eslint-disable @typescript-eslint/no-unused-vars */
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class AuthLocalGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: Error | any) {
    console.log(err, user, info);
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          message: 'Invalid credentials',
          error: 'Unauthorized',
        })
      );
    }
    return user;
  }
}
