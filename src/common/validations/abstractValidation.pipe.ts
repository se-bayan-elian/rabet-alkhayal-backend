import {
  ArgumentMetadata,
  Injectable,
  Type,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { CustomValidationPipe } from './customValidation.pipe';

@Injectable()
export class AbstractValidationPipe extends CustomValidationPipe {
  constructor(
    options: ValidationPipeOptions,
    private readonly targetTypes: {
      body?: Type<any>;
      query?: Type<any>;
      param?: Type<any>;
      custom?: Type<any>;
    },
  ) {
    super(options);
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const targetType = this.targetTypes[metadata.type];
    if (!targetType) {
      return super.transform(value, metadata);
    }
    return super.transform(value, { ...metadata, metatype: targetType });
  }
}
