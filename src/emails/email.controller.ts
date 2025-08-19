import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendContactUsDto } from './dtos/sendContactUs.dto';

@ApiTags('emails')
@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('contact-us')
  @ApiOperation({ summary: 'Send contact us email using Handlebars template' })
  async sendContactUs(@Body() contactData: SendContactUsDto) {
    // Send contact us email using Handlebars template
    await this.emailService.sendContactUsEmail(contactData);

    return {
      message: 'تم إرسال رسالتك بنجاح',
      success: true,
    };
  }
}
