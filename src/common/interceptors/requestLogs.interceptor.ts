import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const logger = new Logger(context.getClass().name);
    const { method, url } = request;
    const start = Date.now();

    logger.log(`Incoming: ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        logger.log(`Completed ${method} ${url} in ${duration}ms`);
      }),
    );
  }
}
