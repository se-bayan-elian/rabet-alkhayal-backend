import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;
}
export class SignInVerificationDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Verification code sent to the user',
    example: '123456',
  })
  code: string;
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;
}
