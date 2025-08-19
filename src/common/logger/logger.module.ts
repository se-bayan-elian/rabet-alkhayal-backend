import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { Request, Response } from 'express';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            levelFirst: true,
            ignore: 'pid,hostname',
            colorize: true,
            messageFormat:
              '{msg} {req.method} {req.url} {res.statusCode} {responseTime}ms',
          },
        },
        customSuccessMessage: (req: Request, res: Response) => {
          return res.statusMessage;
        },
        customErrorMessage: (req: Request, res: Response, error: Error) => {
          return `Request failed: ${error.message} -`;
        },
        // Customize log level based on response status
        customLogLevel: (req: Request, res: Response, error: Error) => {
          if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
          }
          if (res.statusCode >= 500 || error) {
            return 'error';
          }
          return 'info';
        },
      },
    }),
  ],
})
export class LoggerModule {}
