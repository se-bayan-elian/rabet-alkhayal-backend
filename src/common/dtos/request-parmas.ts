import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UuidParamDto {
  @ApiProperty({
    type: String,
    description: 'Unique identifier (UUID)',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'ID cannot be empty' })
  @IsString({ message: 'ID must be String' })
  @IsUUID('4', { message: 'Invalid UUID format' })
  id: string;
}
