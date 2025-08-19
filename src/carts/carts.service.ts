import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartCustomization } from './entities/cart-customization.entity';
import { BaseRepository } from '../common/repository/base.repository';
import { PinoLogger } from 'nestjs-pino';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class CartsService extends BaseRepository<Cart> {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(CartCustomization)
    private readonly cartCustomizationRepository: Repository<CartCustomization>,
    private readonly logger: PinoLogger,
    dataSource: DataSource,
  ) {
    super(cartRepository, dataSource);
    this.logger.setContext(CartsService.name);
  }

  /**
   * Get or create user's cart
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    this.logger.info(`Getting or creating cart for user: ${userId}`);
    
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.customizations'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      cart = await this.cartRepository.save(cart);
      this.logger.info(`Created new cart for user: ${userId}`);
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    this.logger.info(`Adding item to cart for user: ${userId}`);
    
    const cart = await this.getOrCreateCart(userId);
    
    // Check if item with same product and customizations already exists
    const existingItem = await this.findExistingCartItem(
      cart.id,
      addToCartDto.productId,
      addToCartDto.customizations || []
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += addToCartDto.quantity;
      await this.cartItemRepository.save(existingItem);
      this.logger.info(`Updated existing cart item quantity`);
    } else {
      // Create new cart item
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
        unitPrice: addToCartDto.unitPrice,
      });

      const savedCartItem = await this.cartItemRepository.save(cartItem);

      // Add customizations if any
      if (addToCartDto.customizations?.length) {
        const customizations = addToCartDto.customizations.map(cust => 
          this.cartCustomizationRepository.create({
            cartItemId: savedCartItem.id,
            optionId: cust.optionId,
            optionName: cust.optionName,
            selectedValue: cust.selectedValue,
            customerInput: cust.customerInput,
            additionalPrice: cust.additionalPrice,
          })
        );
        await this.cartCustomizationRepository.save(customizations);
      }

      this.logger.info(`Added new item to cart`);
    }

    return this.getCartWithItems(cart.id);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateDto: UpdateCartItemDto
  ): Promise<Cart> {
    this.logger.info(`Updating cart item: ${cartItemId} for user: ${userId}`);
    
    const cart = await this.getOrCreateCart(userId);
    
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (updateDto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    cartItem.quantity = updateDto.quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getCartWithItems(cart.id);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, cartItemId: string): Promise<Cart> {
    this.logger.info(`Removing item from cart: ${cartItemId} for user: ${userId}`);
    
    const cart = await this.getOrCreateCart(userId);
    
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
      relations: ['customizations'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Remove customizations first
    if (cartItem.customizations?.length) {
      await this.cartCustomizationRepository.remove(cartItem.customizations);
    }

    // Remove cart item
    await this.cartItemRepository.remove(cartItem);

    return this.getCartWithItems(cart.id);
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    this.logger.info(`Clearing cart for user: ${userId}`);
    
    const cart = await this.getOrCreateCart(userId);
    
    await this.cartItemRepository.delete({ cartId: cart.id });
  }

  /**
   * Get user's cart
   */
  async getCart(userId: string): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  /**
   * Private helper methods
   */
  private async getCartWithItems(cartId: string): Promise<Cart> {
    return this.cartRepository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.product',
        'items.product.subcategory',
        'items.customizations',
        'items.customizations.option',
      ],
    });
  }

  private async findExistingCartItem(
    cartId: string,
    productId: string,
    customizations: Array<{ optionId: string; optionName: string; selectedValue?: string; customerInput?: string; additionalPrice: number }>
  ): Promise<CartItem | null> {
    const cartItems = await this.cartItemRepository.find({
      where: { cartId, productId },
      relations: ['customizations'],
    });

    // Find item with matching customizations
    for (const item of cartItems) {
      const itemCustomizations = item.customizations || [];
      
      if (this.customizationsMatch(itemCustomizations, customizations)) {
        return item;
      }
    }

    return null;
  }

  private customizationsMatch(
    existing: CartCustomization[],
    newCustomizations: Array<{ optionId: string; optionName: string; selectedValue?: string; customerInput?: string; additionalPrice: number }>
  ): boolean {
    if (existing.length !== newCustomizations.length) {
      return false;
    }

    const existingIds = existing.map(c => c.optionId).sort();
    const newIds = newCustomizations.map(c => c.optionId).sort();

    return existingIds.every((id, index) => id === newIds[index]);
  }
}
