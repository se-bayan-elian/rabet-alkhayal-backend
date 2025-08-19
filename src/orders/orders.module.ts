import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './repository/orders.repository';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: 'IOrdersRepository',
      useClass: OrdersRepository,
    },
    OrdersRepository,
  ],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
