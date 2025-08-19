import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendContactUsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsMobilePhone()
  @IsOptional()
  phone: string;
}
