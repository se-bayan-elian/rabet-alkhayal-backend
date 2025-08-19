import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'Bayan',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'First name can only contain letters and spaces',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Elian',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'Last name can only contain letters and spaces',
  })
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'bezo2024@gmail.com',
  })
  @IsEmail(
    {},
    {
      message: 'Please provide a valid email address',
    },
  )
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
    default: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole, {
    message: 'Invalid role provided',
  })
  @IsOptional()
  role?: UserRole = UserRole.CUSTOMER;

  @ApiProperty({
    description: 'Phone Number',
    example: '96676543210',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+9665|009665|05)[0-9]{8}$/, {
    message: 'Invalid Phone Number format',
  })
  phoneNumber: string;
}
