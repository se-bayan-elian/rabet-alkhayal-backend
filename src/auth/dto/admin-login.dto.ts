import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin email',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'StrongPassword123!',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
