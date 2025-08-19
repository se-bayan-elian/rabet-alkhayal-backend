import { IsString, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactFormDto {
  @ApiProperty({
    description: 'Client name',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Client email',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'Message',
    example: 'I would like to discuss my project requirements...',
  })
  @IsString()
  message: string;
}
