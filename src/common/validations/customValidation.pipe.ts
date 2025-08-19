import {
  BadRequestException,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationError, ValidatorOptions } from 'class-validator';

export class ValidationErrorResponse {
  [key: string]: string[];
}
export class CustomValidationPipe extends ValidationPipe {
  constructor(options?: ValidatorOptions) {
    super({
      ...options,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errors: ValidationErrorResponse = {};

        validationErrors.forEach((error) => {
          // Handle nested validation errors
          const processError = (err: ValidationError, parentProperty = '') => {
            const propertyName = parentProperty
              ? `${parentProperty}.${err.property}`
              : err.property;

            // Collect all constraint messages for this property
            if (err.constraints) {
              errors[propertyName] = Object.values(err.constraints);
            }

            // Recursively process nested errors
            if (err.children && err.children.length) {
              err.children.forEach((childError) =>
                processError(childError, propertyName),
              );
            }
          };

          processError(error);
        });

        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Validation Error',
          errors,
        });
      },
    });
  }
}
