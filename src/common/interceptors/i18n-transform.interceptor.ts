import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class I18nTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest();

        // Check if allTranslations is requested
        const allTranslations = request.query.allTranslations === 'true';
        if (allTranslations) {
          return data; // Return raw data with all translations
        }

        // Check header first, then query param, then default to 'en'
        const lang =
          request.headers['accept-language']?.substring(0, 2) ||
          request.query.lang ||
          'en';

        const transformValue = (val: any): any => {
          if (val && typeof val === 'object') {
            // Check if the object is a translation object (has en/ar keys)
            if ('en' in val && 'ar' in val) {
              return val[lang] || val['en']; // fallback to English
            }
          }
          return val;
        };

        const transformObject = (obj: any): any => {
          if (!obj) return obj;

          if (Array.isArray(obj)) {
            return obj.map(transformObject);
          }

          if (typeof obj === 'object') {
            const transformed = {};
            for (const [key, value] of Object.entries(obj)) {
              if (value && typeof value === 'object') {
                transformed[key] = transformValue(value);
                if (transformed[key] === value) {
                  // if value wasn't a translation object
                  transformed[key] = transformObject(value);
                }
              } else {
                transformed[key] = value;
              }
            }
            return transformed;
          }

          return obj;
        };

        // If data has a nested structure with data property
        if (data && typeof data === 'object' && 'data' in data) {
          return {
            ...data,
            data: transformObject(data.data),
          };
        }

        return transformObject(data);
      }),
    );
  }
}
