import { Module } from '@nestjs/common';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    IoRedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      options: {
        // Connection settings
        connectTimeout: 10000,
        lazyConnect: true,

        // Database selection
        db: 0, // Use database 0 for verification codes

        // Key prefix for organization
        keyPrefix: 'app:', // Prefix for all keys
      },
    }),
  ],
  providers: [VerificationService],
  exports: [IoRedisModule, VerificationService],
})
export class RedisModule {}
