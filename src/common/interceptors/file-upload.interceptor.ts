import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function FileUploadInterceptor(
  fieldName: string,
  localOptions?: MulterOptions,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor extends FileInterceptor(fieldName, {
    ...localOptions,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      ...localOptions?.limits,
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    ...localOptions,
  }) {}

  return mixin(MixinInterceptor);
}
