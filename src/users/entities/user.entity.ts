import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { UserRole } from '../dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '../../carts/entities/cart.entity';

@Entity()
export class User {
  @Column()
  @ApiProperty()
  firstName: string;

  @Column()
  @ApiProperty()
  lastName: string;

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({
    unique: true,
  })
  @ApiProperty()
  email: string;

  @Column({
    default: UserRole.CUSTOMER,
  })
  @ApiProperty()
  role: UserRole;

  @Column({
    default: true,
  })
  @ApiProperty()
  isActive: boolean;

  @Column({
    default: false,
  })
  @ApiProperty({ default: false })
  isVerified: boolean;

  @Column({
    nullable: true,
  })
  googleId: string;
  @Column({
    nullable: true,
  })
  avatar: string;
  @Column({
    nullable: true,
  })
  phoneNumber: string;
  @Column({
    nullable: true,
  })
  address: string;
  @Column({
    default: new Date(Date.now()),
  })
  @ApiProperty()
  createdAt: Date;

  @Column({
    default: new Date(Date.now()),
  })
  @ApiProperty()
  updatedAt: Date;

  @Column({
    nullable: true,
  })
  @ApiProperty()
  deletedAt: Date;

  // Relations
  @ApiProperty({
    description: 'User cart',
    type: () => Cart,
  })
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;
}
