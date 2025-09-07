import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User first name',
    example: 'Ahmed',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'First name can only contain letters and spaces',
  })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Mohammed',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'Last name can only contain letters and spaces',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Phone Number',
    example: '+966505123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+9665|009665|05)[0-9]{8}$/, {
    message: 'Invalid Phone Number format',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'User address',
    example: '123 King Fahd Road, Riyadh, Saudi Arabia',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
