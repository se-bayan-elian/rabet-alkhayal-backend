import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
class TemplateDataDto {
  @IsNotEmpty()
  template: (dynamicValues: any) => string;

  @IsString()
  subject: string;

  @IsString()
  sender: string;
}
export class SendEmailDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true }) // Validate each item as an email
  targets: string[];
  @ValidateNested()
  @Type(() => TemplateDataDto)
  @IsNotEmpty()
  templateData: TemplateDataDto;

  @IsNotEmpty()
  dynamicValues: any;
}
