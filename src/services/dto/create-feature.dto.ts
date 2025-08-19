import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'Logo Design',
  })
  @IsString()
  name: string;
}
