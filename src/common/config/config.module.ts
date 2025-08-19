import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envVarsValidation from './envVars.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
      validationSchema: envVarsValidation(),
      expandVariables: true,
      cache: true, // Cache environment variables
      validationOptions: {
        abortEarly: false, // Show all validation errors at once
        allowUnknown: true, // Allow extra environment variables
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [ConfigModule],
})
export class CustomConfigModule {}
