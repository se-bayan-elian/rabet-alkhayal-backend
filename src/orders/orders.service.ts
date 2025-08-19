import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersRepository } from './repository/orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { Order } from './entities/order.entity';
import { PaymentStatus, OrderStatus } from '../common/enums';
import { PaginatedResponse } from '../common/types';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // If coupon is provided, calculate discount (placeholder logic)
      let discountAmount = 0;
      if (createOrderDto.couponId) {
        // TODO: Implement coupon validation and discount calculation
        // This should integrate with the coupons service when implemented
        discountAmount = 0; // Placeholder
      }

      return await this.ordersRepository.createOrderFromCart(
        userId,
        createOrderDto.cartId,
        {
          paymentMethod: createOrderDto.paymentMethod,
          googleAddress: createOrderDto.googleAddress,
          deliveryEnabled: createOrderDto.deliveryEnabled,
          deliveryFee: createOrderDto.deliveryFee,
          tax: createOrderDto.tax,
          couponId: createOrderDto.couponId,
          discountAmount,
        },
      );
    } catch (error) {
      if (error.message.includes('Cart not found')) {
        throw new NotFoundException(
          'Cart not found or does not belong to user',
        );
      }
      if (error.message.includes('empty cart')) {
        throw new BadRequestException('Cannot create order from empty cart');
      }
      throw error;
    }
  }

  async findAll(queryDto: OrderQueryDto): Promise<PaginatedResponse<Order>> {
    const { page, limit, orderStatus, paymentStatus, startDate, endDate } =
      queryDto;

    // If date range is provided, use date range query
    if (startDate && endDate) {
      const orders = await this.ordersRepository.findByDateRange(
        startDate,
        endDate,
        { orderStatus, paymentStatus },
      );

      // Manual pagination for date range results
      const total = orders.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = orders.slice(startIndex, endIndex);

      return {
        data: paginatedOrders,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // Use standard pagination with filters
    const filters: any = {};
    if (orderStatus) filters.orderStatus = orderStatus;
    if (paymentStatus) filters.paymentStatus = paymentStatus;

    return this.ordersRepository.findManyPaginated({
      page,
      limit,
      filters,
      relations: ['cart', 'user'],
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findByIdWithCart(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findUserOrders(
    userId: string,
    queryDto: OrderQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    const { page, limit, orderStatus, paymentStatus } = queryDto;

    const result = await this.ordersRepository.findUserOrdersPaginated(userId, {
      page,
      limit,
      orderStatus,
      paymentStatus,
    });

    return {
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.ordersRepository.findByIdOrThrow(id);

    // Update payment status if provided
    if (updateOrderDto.paymentStatus !== undefined) {
      return this.ordersRepository.updatePaymentStatus(
        id,
        updateOrderDto.paymentStatus,
      );
    }

    // Update order status if provided
    if (updateOrderDto.orderStatus !== undefined) {
      return this.ordersRepository.updateOrderStatus(
        id,
        updateOrderDto.orderStatus,
      );
    }

    return order;
  }

  async cancel(id: string): Promise<Order> {
    try {
      return await this.ordersRepository.cancelOrder(id);
    } catch (error) {
      if (error.message.includes('cannot be cancelled')) {
        throw new BadRequestException(
          'Order cannot be cancelled in its current state',
        );
      }
      throw error;
    }
  }

  async applyCoupon(
    id: string,
    applyCouponDto: ApplyCouponDto,
  ): Promise<Order> {
    try {
      // TODO: Implement coupon validation logic here
      // This should integrate with the coupons service when implemented
      const discountAmount = applyCouponDto.discountAmount || 0;

      return await this.ordersRepository.applyCoupon(
        id,
        applyCouponDto.couponId,
        discountAmount,
      );
    } catch (error) {
      if (error.message.includes('Order not found')) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      if (error.message.includes('non-pending order')) {
        throw new BadRequestException(
          'Cannot apply coupon to non-pending order',
        );
      }
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  }> {
    return this.ordersRepository.getUserOrderStats(userId);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.ordersRepository.findByOrderStatus(status);
  }

  async getOrdersByPaymentStatus(
    paymentStatus: PaymentStatus,
  ): Promise<Order[]> {
    return this.ordersRepository.findByPaymentStatus(paymentStatus);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    return this.ordersRepository.updatePaymentStatus(id, paymentStatus);
  }

  async updateOrderStatus(
    id: string,
    orderStatus: OrderStatus,
  ): Promise<Order> {
    return this.ordersRepository.updateOrderStatus(id, orderStatus);
  }

  /**
   * Process payment for an order using Moyasar payment gateway
   * Supports Apple Pay, Credit Card, and STC Pay
   */
  async processPayment(
    orderId: string,
    processPaymentDto: ProcessPaymentDto,
    userId: string,
  ): Promise<Order> {
    // Find the order and validate ownership
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found or does not belong to user');
    }

    // Validate order state - only pending orders can be paid
    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in a state that allows payment');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order has already been paid');
    }

    // Validate payment amount (optional verification)
    if (processPaymentDto.amount && processPaymentDto.amount !== order.total) {
      throw new BadRequestException('Payment amount does not match order total');
    }

    try {
      // Process payment based on method
      let paymentResult: { success: boolean; transactionId?: string; error?: string };

      switch (processPaymentDto.paymentMethod) {
        case 'moyasar':
          paymentResult = await this.processMoyasarPayment(order, processPaymentDto);
          break;
        case 'cash':
          // For cash payments, we just mark as confirmed and keep payment pending
          paymentResult = { success: true, transactionId: 'CASH_ON_DELIVERY' };
          break;
        default:
          throw new BadRequestException('Unsupported payment method');
      }

      if (paymentResult.success) {
        // Update order payment status and details
        const updatedOrder = await this.ordersRepository.updatePaymentInfo(orderId, {
          paymentStatus: processPaymentDto.paymentMethod === 'cash' 
            ? PaymentStatus.PENDING 
            : PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
        });

        return updatedOrder;
      } else {
        // Payment failed
        await this.ordersRepository.updatePaymentStatus(orderId, PaymentStatus.FAILED);
        throw new BadRequestException(`Payment failed: ${paymentResult.error}`);
      }
    } catch (error) {
      // Log payment error and update status
      console.error('Payment processing error:', error);
      
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      await this.ordersRepository.updatePaymentStatus(orderId, PaymentStatus.FAILED);
      throw new BadRequestException('Payment processing failed');
    }
  }

  /**
   * Process payment through Moyasar gateway
   * Handles Apple Pay, Credit Card, and STC Pay
   */
  private async processMoyasarPayment(
    order: Order,
    processPaymentDto: ProcessPaymentDto,
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // TODO: Integrate with actual Moyasar API
    // This is a placeholder implementation
    
    // Validate transaction ID is provided for Moyasar payments
    if (!processPaymentDto.transactionId) {
      return { 
        success: false, 
        error: 'Transaction ID is required for Moyasar payments' 
      };
    }

    // Here you would:
    // 1. Verify the transaction with Moyasar API
    // 2. Check payment status
    // 3. Validate payment amount
    // 4. Handle different payment methods (Apple Pay, Credit Card, STC Pay)
    
    // Placeholder success response
    return {
      success: true,
      transactionId: processPaymentDto.transactionId,
    };

    // Example of how to handle Moyasar API integration:
    /*
    try {
      const moyasarResponse = await this.httpService.post('https://api.moyasar.com/v1/payments/verify', {
        transaction_id: processPaymentDto.transactionId,
        amount: order.totalAmount * 100, // Convert to cents
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(moyasarApiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }).toPromise();

      if (moyasarResponse.data.status === 'paid') {
        return {
          success: true,
          transactionId: moyasarResponse.data.id,
        };
      } else {
        return {
          success: false,
          error: `Payment not confirmed: ${moyasarResponse.data.status}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to verify payment with Moyasar',
      };
    }
    */
  }
}
