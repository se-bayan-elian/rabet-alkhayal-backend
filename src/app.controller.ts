import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PinoLogger } from 'nestjs-pino';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AppController.name);
  }

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHello(): string {
    this.logger.info('🏠 Health check endpoint called');
    this.logger.debug('Debug: Application is running properly');
    this.logger.warn('Warning: This is a test warning log');

    return this.appService.getHello();
  }

  @Get('test-logs')
  @ApiOperation({ summary: 'Test Pino logger with different levels' })
  testLogs(): any {
    this.logger.debug('🐛 Debug message');
    this.logger.info('ℹ️  Info message');
    this.logger.warn('⚠️  Warning message');
    this.logger.error('❌ Error message');

    return {
      message: 'Check your console/logs for Pino output',
      timestamp: new Date().toISOString(),
      levels: ['debug', 'info', 'warn', 'error'],
    };
  }
}
