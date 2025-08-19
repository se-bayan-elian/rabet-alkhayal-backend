import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { Order } from './entities/order.entity';
import { PaymentStatus, OrderStatus } from '../common/enums';
import { PaginatedResponse } from '../common/types/paginated-response.type';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/helpers/enums';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or empty cart',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cart not found or does not belong to user',
  })
  async create(
    @Request() req: any,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Post(':id/process-payment')
  @ApiOperation({ summary: 'Process payment for an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment processed successfully',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment data or order not eligible for payment',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async processPayment(
    @Param('id') id: string,
    @Body() processPaymentDto: ProcessPaymentDto,
    @Request() req: any,
  ): Promise<Order> {
    return this.ordersService.processPayment(id, processPaymentDto, req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all orders with pagination and filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: Order,
    isArray: true,
  })
  async findAll(
    @Query() queryDto: OrderQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.ordersService.findAll(queryDto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User orders retrieved successfully',
    type: Order,
    isArray: true,
  })
  async findMyOrders(
    @Request() req: any,
    @Query() queryDto: OrderQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.ordersService.findUserOrders(req.user.id, queryDto);
  }

  @Get('my-stats')
  @ApiOperation({ summary: 'Get current user order statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User order statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalOrders: { type: 'number', example: 25 },
        totalSpent: { type: 'number', example: 1299.99 },
        pendingOrders: { type: 'number', example: 2 },
        completedOrders: { type: 'number', example: 20 },
        cancelledOrders: { type: 'number', example: 3 },
      },
    },
  })
  async getMyStats(@Request() req: any): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  }> {
    return this.ordersService.getUserStats(req.user.id);
  }

  @Get('status/:status')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get orders by order status' })
  @ApiParam({
    name: 'status',
    enum: OrderStatus,
    description: 'Order status to filter by',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: Order,
    isArray: true,
  })
  async findByStatus(@Param('status') status: OrderStatus): Promise<Order[]> {
    return this.ordersService.getOrdersByStatus(status);
  }

  @Get('payment-status/:paymentStatus')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get orders by payment status' })
  @ApiParam({
    name: 'paymentStatus',
    enum: PaymentStatus,
    description: 'Payment status to filter by',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: Order,
    isArray: true,
  })
  async findByPaymentStatus(
    @Param('paymentStatus') paymentStatus: PaymentStatus,
  ): Promise<Order[]> {
    return this.ordersService.getOrdersByPaymentStatus(paymentStatus);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID with full details' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order retrieved successfully',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update order status or payment status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order cancelled successfully',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Order cannot be cancelled in its current state',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async cancel(@Param('id') id: string): Promise<Order> {
    return this.ordersService.cancel(id);
  }

  @Patch(':id/apply-coupon')
  @ApiOperation({ summary: 'Apply coupon to order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupon applied successfully',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot apply coupon to non-pending order',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async applyCoupon(
    @Param('id') id: string,
    @Body() applyCouponDto: ApplyCouponDto,
  ): Promise<Order> {
    return this.ordersService.applyCoupon(id, applyCouponDto);
  }

  @Patch(':id/payment-status')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update order payment status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiQuery({
    name: 'status',
    enum: PaymentStatus,
    description: 'New payment status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment status updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Query('status') paymentStatus: PaymentStatus,
  ): Promise<Order> {
    return this.ordersService.updatePaymentStatus(id, paymentStatus);
  }

  @Patch(':id/order-status')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiQuery({
    name: 'status',
    enum: OrderStatus,
    description: 'New order status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Query('status') orderStatus: OrderStatus,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, orderStatus);
  }
}
