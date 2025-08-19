export type ConfigServiceType = {
  DATABASE_HOST: string;
  DATABASE_PORT: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  NODE_ENV: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRATION: string;
  JWT_REFRESH_PERSISTENT_EXPIRATION: string;
  GOOGLE_CALLBACK_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};
