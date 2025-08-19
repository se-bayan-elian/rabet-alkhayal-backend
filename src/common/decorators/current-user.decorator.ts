import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

const getCurrentUserFromContext = (context: ExecutionContext): User =>
  context.switchToHttp().getRequest().user;

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserFromContext(context),
);
