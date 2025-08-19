import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { PinoLogger } from 'nestjs-pino';
import { UserRole } from 'src/users/dto/create-user.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    readonly logger: PinoLogger,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const isAllowed = user && requiredRoles.some((role) => user.role === role);
    this.logger.info(`userRole:${user.role},isAllowed:${isAllowed}`);
    return isAllowed;
  }
}
