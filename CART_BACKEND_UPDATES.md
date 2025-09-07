# Backend Updates for Enhanced Cart System

## Overview

This document outlines the necessary backend changes to support the new cart features including customization editing, delivery options, and proper price calculations.

## 1. Delivery Settings API

### Create Delivery Settings Entity

```typescript
// src/delivery/entities/delivery-setting.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('delivery_settings')
export class DeliverySetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  estimatedDays: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Create Delivery Controller

```typescript
// src/delivery/delivery.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async getDeliveryOptions() {
    return {
      success: true,
      data: await this.deliveryService.getActiveDeliveryOptions(),
      message: 'Delivery options retrieved successfully',
    };
  }
}
```

### Create Delivery Service

```typescript
// src/delivery/delivery.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliverySetting } from './entities/delivery-setting.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliverySetting)
    private deliveryRepository: Repository<DeliverySetting>,
  ) {}

  async getActiveDeliveryOptions() {
    return this.deliveryRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }
}
```

## 2. Cart Entity Updates

### Update Cart Item Entity

```typescript
// src/carts/entities/cart-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';
import { CartItemCustomization } from './cart-item-customization.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  customizationCost: number;

  @OneToMany(
    () => CartItemCustomization,
    (customization) => customization.cartItem,
    { cascade: true },
  )
  customizations: CartItemCustomization[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Create Cart Item Customization Entity

```typescript
// src/carts/entities/cart-item-customization.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('cart_item_customizations')
export class CartItemCustomization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartItem, (cartItem) => cartItem.customizations, {
    onDelete: 'CASCADE',
  })
  cartItem: CartItem;

  @Column()
  questionId: string;

  @Column({ nullable: true })
  answerId: string;

  @Column('text', { nullable: true })
  textValue: string;

  @Column({ nullable: true })
  imagePublicId: string;
}
```

### Update Cart Entity

```typescript
// src/carts/entities/cart.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';
import { DeliverySetting } from '../../delivery/entities/delivery-setting.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @Column({ default: 'company' })
  deliveryType: 'company' | 'home';

  @ManyToOne(() => DeliverySetting, { nullable: true })
  selectedDeliveryOption: DeliverySetting;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deliveryCost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 3. Cart Service Updates

### Update Cart DTOs

```typescript
// src/carts/dto/create-cart-item.dto.ts
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomizationDto {
  @IsString()
  questionId: string;

  @IsOptional()
  @IsString()
  answerId?: string;

  @IsOptional()
  @IsString()
  textValue?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;
}

export class CreateCartItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomizationDto)
  customizations?: CreateCustomizationDto[];
}

// src/carts/dto/update-cart.dto.ts
export class UpdateCartDto {
  @IsOptional()
  @IsString()
  deliveryType?: 'company' | 'home';

  @IsOptional()
  @IsUUID()
  selectedDeliveryOptionId?: string;
}
```

### Update Cart Service Methods

```typescript
// src/carts/carts.service.ts
async addItem(userId: string, createCartItemDto: CreateCartItemDto) {
  const { productId, quantity, customizations = [] } = createCartItemDto;

  // Get or create cart
  let cart = await this.getCartByUserId(userId);
  if (!cart) {
    cart = await this.createCart(userId);
  }

  // Get product with questions and answers
  const product = await this.productsService.findOneWithQuestions(productId);
  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // Calculate customization cost
  let customizationCost = 0;
  for (const customization of customizations) {
    if (customization.answerId) {
      const question = product.questions.find(q => q.id === customization.questionId);
      if (question) {
        const answer = question.answers.find(a => a.id === customization.answerId);
        if (answer) {
          customizationCost += parseFloat(answer.extraPrice.toString());
        }
      }
    }
  }

  // Create cart item
  const cartItem = this.cartItemRepository.create({
    cart,
    product,
    quantity,
    customizationCost,
    customizations: customizations.map(c => this.cartItemCustomizationRepository.create(c))
  });

  await this.cartItemRepository.save(cartItem);

  return this.getCartWithItems(cart.id);
}

async updateItemCustomizations(userId: string, itemId: string, customizations: CreateCustomizationDto[]) {
  const cartItem = await this.cartItemRepository.findOne({
    where: { id: itemId, cart: { user: { id: userId } } },
    relations: ['cart', 'product', 'product.questions', 'product.questions.answers', 'customizations']
  });

  if (!cartItem) {
    throw new NotFoundException('Cart item not found');
  }

  // Remove existing customizations
  await this.cartItemCustomizationRepository.delete({ cartItem: { id: itemId } });

  // Calculate new customization cost
  let customizationCost = 0;
  const newCustomizations = [];

  for (const customization of customizations) {
    if (customization.answerId) {
      const question = cartItem.product.questions.find(q => q.id === customization.questionId);
      if (question) {
        const answer = question.answers.find(a => a.id === customization.answerId);
        if (answer) {
          customizationCost += parseFloat(answer.extraPrice.toString());
        }
      }
    }

    newCustomizations.push(this.cartItemCustomizationRepository.create({
      cartItem,
      ...customization
    }));
  }

  // Update cart item
  cartItem.customizationCost = customizationCost;
  cartItem.customizations = newCustomizations;

  await this.cartItemRepository.save(cartItem);

  return this.getCartWithItems(cartItem.cart.id);
}

async updateDeliveryOptions(userId: string, updateCartDto: UpdateCartDto) {
  const cart = await this.getCartByUserId(userId);
  if (!cart) {
    throw new NotFoundException('Cart not found');
  }

  if (updateCartDto.deliveryType) {
    cart.deliveryType = updateCartDto.deliveryType;
  }

  if (updateCartDto.selectedDeliveryOptionId) {
    const deliveryOption = await this.deliveryService.findOne(updateCartDto.selectedDeliveryOptionId);
    if (!deliveryOption) {
      throw new NotFoundException('Delivery option not found');
    }
    cart.selectedDeliveryOption = deliveryOption;
    cart.deliveryCost = cart.deliveryType === 'home' ? deliveryOption.price : 0;
  } else if (updateCartDto.deliveryType === 'company') {
    cart.selectedDeliveryOption = null;
    cart.deliveryCost = 0;
  }

  await this.cartRepository.save(cart);

  return this.getCartWithItems(cart.id);
}
```

## 4. Controller Updates

### Update Cart Controller

```typescript
// src/carts/carts.controller.ts
@Put('delivery')
async updateDeliveryOptions(
  @GetUser() user: User,
  @Body() updateCartDto: UpdateCartDto
) {
  return {
    success: true,
    data: await this.cartsService.updateDeliveryOptions(user.id, updateCartDto),
    message: 'Delivery options updated successfully'
  };
}

@Put('items/:itemId/customizations')
async updateItemCustomizations(
  @GetUser() user: User,
  @Param('itemId') itemId: string,
  @Body() customizations: CreateCustomizationDto[]
) {
  return {
    success: true,
    data: await this.cartsService.updateItemCustomizations(user.id, itemId, customizations),
    message: 'Item customizations updated successfully'
  };
}
```

## 5. Database Migration

```typescript
// src/migrations/YYYYMMDDHHMMSS-cart-enhancements.ts
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CartEnhancements1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create delivery_settings table
    await queryRunner.createTable(
      new Table({
        name: 'delivery_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price', type: 'decimal(10,2)' },
          { name: 'estimatedDays', type: 'int', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Add columns to carts table
    await queryRunner.addColumns('carts', [
      new TableColumn({
        name: 'deliveryType',
        type: 'varchar',
        default: "'company'",
      }),
      new TableColumn({
        name: 'selectedDeliveryOptionId',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'deliveryCost',
        type: 'decimal(10,2)',
        default: 0,
      }),
    ]);

    // Add foreign key for delivery option
    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['selectedDeliveryOptionId'],
        referencedTableName: 'delivery_settings',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Add customization cost to cart_items
    await queryRunner.addColumn(
      'cart_items',
      new TableColumn({
        name: 'customizationCost',
        type: 'decimal(10,2)',
        default: 0,
      }),
    );

    // Create cart_item_customizations table
    await queryRunner.createTable(
      new Table({
        name: 'cart_item_customizations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'cartItemId', type: 'uuid' },
          { name: 'questionId', type: 'uuid' },
          { name: 'answerId', type: 'uuid', isNullable: true },
          { name: 'textValue', type: 'text', isNullable: true },
          { name: 'imagePublicId', type: 'varchar', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['cartItemId'],
            referencedTableName: 'cart_items',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    // Insert default delivery options
    await queryRunner.query(`
      INSERT INTO delivery_settings (name, description, price, estimatedDays, isActive) VALUES
      ('Standard Delivery', 'Regular delivery within city limits', 5.00, 3, true),
      ('Express Delivery', 'Fast delivery within 24 hours', 15.00, 1, true),
      ('Premium Delivery', 'Same day delivery for urgent orders', 25.00, 0, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cart_item_customizations');
    await queryRunner.dropColumn('cart_items', 'customizationCost');
    await queryRunner.dropForeignKey(
      'carts',
      'FK_carts_selectedDeliveryOptionId',
    );
    await queryRunner.dropColumns('carts', [
      'deliveryType',
      'selectedDeliveryOptionId',
      'deliveryCost',
    ]);
    await queryRunner.dropTable('delivery_settings');
  }
}
```

## 6. Module Updates

### Update Cart Module

```typescript
// src/carts/carts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartItemCustomization } from './entities/cart-item-customization.entity';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, CartItemCustomization]),
    DeliveryModule,
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
```

### Create Delivery Module

```typescript
// src/delivery/delivery.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliverySetting } from './entities/delivery-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliverySetting])],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
```

## Implementation Steps

1. **Create the delivery module and entities**
2. **Run the database migration**
3. **Update cart entities and relationships**
4. **Implement the new service methods**
5. **Update controller endpoints**
6. **Test the API endpoints**
7. **Update frontend integration**

This backend implementation will support all the new cart features including customization editing, delivery options, and proper price calculations.
