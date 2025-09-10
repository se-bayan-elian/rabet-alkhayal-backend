import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { CustomExceptionFilter } from './common/filters/exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
async function bootstrap() {
  try {
    // Create app with buffered logs
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    // Get services
    const configService =app.get(ConfigService);

    // Enable CORS
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
      ],
      exposedHeaders: ['Set-Cookie'],
    });
    app.useGlobalFilters(new CustomExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Set global prefix
    app.setGlobalPrefix(`/api/${configService.get('VERSION')}`);
    // Configure Swagger
    const options = new DocumentBuilder()
      .setTitle('Rabet Alkhayal API')
      .setDescription('The Rabet-Alkhayal API Documentation')
      .setVersion(configService.get('VERSION'))
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'headers',
          name: 'Authorization',
        },
        'Authorization',
      )
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/docs', app, document);

    // Configure Pino logger
    try {
      const logger = app.get(Logger);
      app.useLogger(logger);
      console.log('🚀 Pino logger initialized successfully');
    } catch (error) {
      console.warn(
        '⚠️  Failed to initialize Pino logger, using default logger',
      );
      console.error(error);
    }

    // Start server
    const port = configService.get('PORT') ?? 3000;
    await app.listen(port);

    console.log(
      `🌐 Application is running on: http://localhost:${port}/api/${configService.get('VERSION')}`,
    );
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
