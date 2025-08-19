import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

@Entity('admins')
export class Admin {
  @ApiProperty({
    description: 'Admin ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Admin name',
    example: 'John Doe',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Admin email',
    example: 'admin@example.com',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({
    description: 'Admin role',
    example: 'super_admin',
    enum: ['super_admin', 'admin', 'manager'],
  })
  @Column({
    type: 'enum',
    enum: ['super_admin', 'admin', 'manager'],
    default: 'admin',
  })
  role: string;

  @ApiProperty({
    description: 'Last login date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true, name: 'last_login' })
  lastLogin?: Date;

  @ApiProperty({
    description: 'Whether the admin is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Admin creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Admin last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
