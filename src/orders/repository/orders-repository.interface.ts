import { IBaseRepository } from '../../common/repository/interfaces/base-repository.interface';
import { Order } from '../entities/order.entity';
import { PaymentStatus, OrderStatus } from '../../common/enums';

export interface IOrdersRepository extends IBaseRepository<Order> {
  /**
   * Create order with cart total calculation
   */
  createOrderFromCart(
    userId: string,
    cartId: string,
    orderData: Partial<Order>,
  ): Promise<Order>;

  /**
   * Update order payment status
   */
  updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order>;

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<Order>;

  /**
   * Get orders by user ID
   */
  findByUserId(userId: string): Promise<Order[]>;

  /**
   * Get orders by payment status
   */
  findByPaymentStatus(paymentStatus: PaymentStatus): Promise<Order[]>;

  /**
   * Get orders by order status
   */
  findByOrderStatus(orderStatus: OrderStatus): Promise<Order[]>;

  /**
   * Get order with cart details
   */
  findByIdWithCart(orderId: string): Promise<Order | null>;

  /**
   * Get user orders with pagination
   */
  findUserOrdersPaginated(
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
  }>;

  /**
   * Calculate order statistics for user
   */
  getUserOrderStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  }>;

  /**
   * Get orders within date range
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    },
  ): Promise<Order[]>;

  /**
   * Cancel order if eligible
   */
  cancelOrder(orderId: string): Promise<Order>;

  /**
   * Apply coupon to order
   */
  applyCoupon(
    orderId: string,
    couponId: string,
    discountAmount: number,
  ): Promise<Order>;
}
