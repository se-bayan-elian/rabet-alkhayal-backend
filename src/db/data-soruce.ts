import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});
type dataSrcOptions = () => DataSourceOptions;
export const dataSourceOptions: dataSrcOptions = () => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  logging: false, // Add this line
  ssl: false, // Important for Render's PostgreSQL
});
const dataSource = new DataSource(dataSourceOptions());
export default dataSource;
