import * as Joi from 'joi';

export default () =>
  Joi.object({
    PORT: Joi.number().required().default(3005),
    NODE_ENV: Joi.valid('development', 'production')
      .required()
      .default('development'),
    VERSION: Joi.string().required().default('v1'),

    // Redis Configuration
    REDIS_URL: Joi.string().required().default('redis://localhost:6379'),

    // Database Configuration
    DATABASE_HOST: Joi.string().required().default('localhost'),
    DATABASE_PORT: Joi.number().required().default(5432),
    DATABASE_USER: Joi.string().required().default('postgres'),
    DATABASE_PASSWORD: Joi.string().required().default('55687123'),
    DATABASE_NAME: Joi.string().required().default('bazar_db'),
    JWT_REFRESH_PERSISTENT_EXPIRATION: Joi.string().required().default('30d'),
    JWT_ACCESS_EXPIRATION: Joi.string().required().default('15m'),
    JWT_REFRESH_EXPIRATION: Joi.string().required().default('1h'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().required(),
    EMAIL_USER: Joi.string().required(),
    EMAIL_PASSWORD: Joi.string().required(),
    EMAIL_HOST: Joi.string().required(),
    EMAIL_PORT: Joi.number().required(),
    EMAIL_SECURE: Joi.boolean().required(),
    EMAIL_POOL: Joi.boolean().required(),
  });
