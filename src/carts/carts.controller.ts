import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { Cart } from './entities/cart.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('carts')
@Controller('carts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cart retrieved successfully',
    type: Cart,
  })
  getCart(@Request() req: any) {
    return this.cartsService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item added to cart successfully',
    type: Cart,
  })
  addToCart(@Request() req: any, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(req.user.id, addToCartDto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cart item updated successfully',
    type: Cart,
  })
  updateCartItem(
    @Request() req: any,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateCartItem(req.user.id, itemId, updateDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item removed from cart successfully',
    type: Cart,
  })
  removeFromCart(@Request() req: any, @Param('itemId') itemId: string) {
    return this.cartsService.removeFromCart(req.user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cart cleared successfully',
  })
  clearCart(@Request() req: any) {
    return this.cartsService.clearCart(req.user.id);
  }
}
