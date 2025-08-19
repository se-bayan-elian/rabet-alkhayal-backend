import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';

export enum VerificationType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR_AUTH = '2fa',
  PHONE_VERIFICATION = 'phone_verification',
}

@Injectable()
export class VerificationService {
  constructor(@InjectRedis() private readonly redis: any) {}

  /**
   * Store a verification code with automatic expiration
   * @param type - Type of verification (email, password reset, etc.)
   * @param identifier - User email, phone, or user ID
   * @param code - The verification code
   * @param expirationMinutes - How long the code should be valid (default: 15 minutes)
   */
  async storeVerificationCode(
    type: VerificationType,
    identifier: string,
    code: string,
    expirationMinutes: number = 15,
  ): Promise<void> {
    const key = this.generateKey(type, identifier);
    const expirationSeconds = expirationMinutes * 60;

    // Store the code with expiration
    await this.redis.setex(key, expirationSeconds, code);
  }

  /**
   * Verify a code and optionally delete it after verification
   * @param type - Type of verification
   * @param identifier - User identifier
   * @param code - Code to verify
   * @param deleteAfterVerification - Whether to delete the code after successful verification
   */
  async verifyCode(
    type: VerificationType,
    identifier: string,
    code: string,
    deleteAfterVerification: boolean = true,
  ): Promise<boolean> {
    const key = this.generateKey(type, identifier);
    const storedCode = await this.redis.get(key);

    if (!storedCode || storedCode !== code) {
      return false;
    }

    // Optionally delete the code after successful verification
    if (deleteAfterVerification) {
      await this.redis.del(key);
    }

    return true;
  }

  /**
   * Check if a verification code exists and get remaining TTL
   * @param type - Type of verification
   * @param identifier - User identifier
   */
  async getCodeInfo(
    type: VerificationType,
    identifier: string,
  ): Promise<{ exists: boolean; ttl: number }> {
    const key = this.generateKey(type, identifier);
    const ttl = await this.redis.ttl(key);

    return {
      exists: ttl > 0,
      ttl: ttl > 0 ? ttl : 0, // TTL in seconds, -1 means no expiration, -2 means key doesn't exist
    };
  }

  /**
   * Delete a verification code manually
   * @param type - Type of verification
   * @param identifier - User identifier
   */
  async deleteVerificationCode(
    type: VerificationType,
    identifier: string,
  ): Promise<boolean> {
    const key = this.generateKey(type, identifier);
    const result = await this.redis.del(key);
    return result > 0;
  }

  /**
   * Generate a unique key for the verification code
   * @param type - Type of verification
   * @param identifier - User identifier
   */
  private generateKey(type: VerificationType, identifier: string): string {
    return `${type}:${identifier.toLowerCase()}`;
  }

  /**
   * Store rate limiting data to prevent spam
   * @param identifier - User identifier (email, phone, etc.)
   * @param type - Type of verification
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMinutes - Time window in minutes
   */
  async checkRateLimit(
    identifier: string,
    type: VerificationType,
    maxAttempts: number = 5,
    windowMinutes: number = 60,
  ): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    resetTime: number;
  }> {
    const rateLimitKey = `rate_limit:${type}:${identifier.toLowerCase()}`;
    const windowSeconds = windowMinutes * 60;

    const current = await this.redis.get(rateLimitKey);
    const attempts = current ? parseInt(current) : 0;

    if (attempts >= maxAttempts) {
      const ttl = await this.redis.ttl(rateLimitKey);
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: Date.now() + ttl * 1000,
      };
    }

    // Increment attempts
    if (attempts === 0) {
      await this.redis.setex(rateLimitKey, windowSeconds, 1);
    } else {
      await this.redis.incr(rateLimitKey);
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - attempts - 1,
      resetTime: 0,
    };
  }

  /**
   * Reset rate limiting for a user
   * @param identifier - User identifier
   * @param type - Type of verification
   */
  async resetRateLimit(
    identifier: string,
    type: VerificationType,
  ): Promise<void> {
    const rateLimitKey = `rate_limit:${type}:${identifier.toLowerCase()}`;
    await this.redis.del(rateLimitKey);
  }
}
