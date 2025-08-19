import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    console.log(exceptionResponse);
    const errorResponse = {
      success: false,
      statusCode: status,
      message: exceptionResponse['message'] || 'An unexpected error occurred',
      errorType: exception.name,
    };

    response.status(status).json(errorResponse);
  }
}
