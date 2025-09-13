import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ServicesModule } from '../services/services.module';

@Global()
@Module({
  imports: [
    ServicesModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          port: configService.get('EMAIL_PORT'),
          secure: configService.get('EMAIL_SECURE'), // true for 465, false for other ports
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
          pool: configService.get('EMAIL_POOL'),
        },
        defaults: {
          from: `"${configService.get('APP_NAME', 'رابط الخيال')}" <${configService.get('EMAIL_USER')}>`,
        },
        template: {
          dir: join(process.cwd(), 'src', 'emails', 'templates', 'hbs'),
          adapter: new HandlebarsAdapter({
            // Register custom helpers
            eq: (a: any, b: any) => a === b,
            ne: (a: any, b: any) => a !== b,
            gt: (a: any, b: any) => a > b,
            lt: (a: any, b: any) => a < b,
            and: (a: any, b: any) => a && b,
            or: (a: any, b: any) => a || b,
          }),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService, MailerModule],
})
export class EmailModule {}
