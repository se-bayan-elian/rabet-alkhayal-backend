import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryCostDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  cost: number;
}

export class UpdateDeliveryCostsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryCostDto)
  deliveryCosts: DeliveryCostDto[];
}
