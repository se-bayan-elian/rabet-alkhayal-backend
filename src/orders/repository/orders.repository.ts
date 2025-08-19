import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repository/base.repository';
import { Order } from '../entities/order.entity';
import { IOrdersRepository } from './orders-repository.interface';
import { PaymentStatus, OrderStatus } from '../../common/enums';
import { Cart } from '../../carts/entities/cart.entity';

@Injectable()
export class OrdersRepository
  extends BaseRepository<Order>
  implements IOrdersRepository
{
  constructor(
    @InjectRepository(Order)
    repository: Repository<Order>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  async createOrderFromCart(
    userId: string,
    cartId: string,
    orderData: Partial<Order>,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // Get cart with items to calculate total
      const cart = await manager.getRepository(Cart).findOne({
        where: { id: cartId, userId },
        relations: ['items', 'items.product', 'items.customizations'],
      });

      if (!cart) {
        throw new Error('Cart not found or does not belong to user');
      }

      if (cart.items.length === 0) {
        throw new Error('Cannot create order from empty cart');
      }

      // Calculate totals
      const subtotal = cart.totalValue;
      const deliveryFee = orderData.deliveryEnabled
        ? orderData.deliveryFee || 0
        : 0;
      const tax = orderData.tax || 0;
      const discountAmount = orderData.discountAmount || 0;
      const total = subtotal + deliveryFee + tax - discountAmount;

      // Create order
      const order = manager.getRepository(Order).create({
        userId,
        cartId,
        total,
        deliveryFee,
        tax,
        discountAmount,
        ...orderData,
      });

      return manager.getRepository(Order).save(order);
    });
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    const order = await this.findByIdOrThrow(orderId);

    order.paymentStatus = paymentStatus;

    // Auto-update order status based on payment status
    if (
      paymentStatus === PaymentStatus.PAID &&
      order.orderStatus === OrderStatus.PENDING
    ) {
      order.orderStatus = OrderStatus.CONFIRMED;
    } else if (paymentStatus === PaymentStatus.FAILED) {
      order.orderStatus = OrderStatus.CANCELLED;
    }

    return this.repository.save(order);
  }

  async updateOrderStatus(
    orderId: string,
    orderStatus: OrderStatus,
  ): Promise<Order> {
    const order = await this.findByIdOrThrow(orderId);
    order.orderStatus = orderStatus;
    return this.repository.save(order);
  }

  async updatePaymentInfo(
    orderId: string,
    paymentInfo: {
      paymentStatus?: PaymentStatus;
      orderStatus?: OrderStatus;
    },
  ): Promise<Order> {
    const order = await this.findByIdOrThrow(orderId);
    
    if (paymentInfo.paymentStatus !== undefined) {
      order.paymentStatus = paymentInfo.paymentStatus;
    }
    
    if (paymentInfo.orderStatus !== undefined) {
      order.orderStatus = paymentInfo.orderStatus;
    }

    return this.repository.save(order);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.repository.find({
      where: { userId },
      relations: ['cart', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPaymentStatus(paymentStatus: PaymentStatus): Promise<Order[]> {
    return this.repository.find({
      where: { paymentStatus },
      relations: ['cart', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByOrderStatus(orderStatus: OrderStatus): Promise<Order[]> {
    return this.repository.find({
      where: { orderStatus },
      relations: ['cart', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdWithCart(orderId: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id: orderId },
      relations: [
        'cart',
        'cart.items',
        'cart.items.product',
        'cart.items.customizations',
        'user',
      ],
    });
  }

  async findUserOrdersPaginated(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    },
  ): Promise<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, orderStatus, paymentStatus } = options;

    const queryBuilder = this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.cart', 'cart')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC');

    if (orderStatus) {
      queryBuilder.andWhere('order.orderStatus = :orderStatus', {
        orderStatus,
      });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserOrderStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  }> {
    const orders = await this.repository.find({
      where: { userId },
      select: ['orderStatus', 'total'],
    });

    const stats = {
      totalOrders: orders.length,
      totalSpent: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };

    orders.forEach((order) => {
      stats.totalSpent += Number(order.total);

      switch (order.orderStatus) {
        case OrderStatus.PENDING:
        case OrderStatus.CONFIRMED:
        case OrderStatus.PROCESSING:
          stats.pendingOrders++;
          break;
        case OrderStatus.SHIPPED:
        case OrderStatus.DELIVERED:
          stats.completedOrders++;
          break;
        case OrderStatus.CANCELLED:
          stats.cancelledOrders++;
          break;
      }
    });

    return stats;
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    },
  ): Promise<Order[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.cart', 'cart')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('order.createdAt', 'DESC');

    if (options?.orderStatus) {
      queryBuilder.andWhere('order.orderStatus = :orderStatus', {
        orderStatus: options.orderStatus,
      });
    }

    if (options?.paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: options.paymentStatus,
      });
    }

    return queryBuilder.getMany();
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.findByIdOrThrow(orderId);

    if (!order.canBeCancelled) {
      throw new Error('Order cannot be cancelled in its current state');
    }

    order.orderStatus = OrderStatus.CANCELLED;
    return this.repository.save(order);
  }

  async applyCoupon(
    orderId: string,
    couponId: string,
    discountAmount: number,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.getRepository(Order).findOne({
        where: { id: orderId },
        relations: ['cart'],
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.orderStatus !== OrderStatus.PENDING) {
        throw new Error('Cannot apply coupon to non-pending order');
      }

      // Update order with coupon
      order.couponId = couponId;
      order.discountAmount = discountAmount;

      // Recalculate total
      const subtotal = order.total + order.discountAmount; // Get original total
      order.total = subtotal + order.tax + order.deliveryFee - discountAmount;

      return manager.getRepository(Order).save(order);
    });
  }
}
