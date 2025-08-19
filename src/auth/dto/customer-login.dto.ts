import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerLoginDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
