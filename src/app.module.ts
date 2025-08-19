import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-soruce';
import { CustomConfigModule } from './common/config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './common/redis/redis.module';
import { EmailModule } from './emails/email.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartsModule } from './carts/carts.module';
import { ServicesModule } from './services/services.module';
import { CouponsModule } from './coupons/coupons.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    CustomConfigModule,
    LoggerModule,
    TypeOrmModule.forRoot(dataSourceOptions()),
    UsersModule,
    AuthModule,
    RedisModule,
    EmailModule,
    ProductsModule,
    OrdersModule,
    CartsModule,
    ServicesModule,
    CouponsModule,
    BannersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
