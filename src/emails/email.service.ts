import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SendContactUsDto } from './dtos/sendContactUs.dto';

export interface VerificationEmailData {
  userName: string;
  verificationCode: string;
  verificationType:
    | 'email_verification'
    | 'password_reset'
    | '2fa'
    | 'phone_verification';
  expiryMinutes: number;
  ipAddress?: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send contact us email using Handlebars template
   */
  async sendContactUsEmail(data: SendContactUsDto): Promise<void> {
    const templateData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      date: new Date().toLocaleDateString('ar-SA'),
    };

    await this.mailerService.sendMail({
      to: this.configService.get('ADMIN_EMAIL', 'admin@example.com'),
      subject: `رسالة جديدة من نموذج الاتصال - ${data.name}`,
      template: 'contact-us', // This refers to contact-us.hbs
      context: templateData,
    });
  }

  /**
   * Send verification code email using Handlebars template
   */
  async sendVerificationEmail(
    email: string,
    data: VerificationEmailData,
  ): Promise<void> {
    const templateData = {
      userName: data.userName,
      verificationCode: data.verificationCode,
      verificationType: data.verificationType,
      expiryMinutes: data.expiryMinutes,
      appName: this.configService.get('APP_NAME', 'ربط الخيال'),
      appLogo: '🚀', // You can replace with actual logo URL
      supportUrl: this.configService.get(
        'SUPPORT_URL',
        'mailto:support@example.com',
      ),
      date: new Date().toLocaleString('ar-SA'),
      currentYear: new Date().getFullYear(),
    };

    const subjectMap = {
      email_verification: 'تأكيد عنوان البريد الإلكتروني',
      password_reset: 'إعادة تعيين كلمة المرور',
      '2fa': 'رمز التحقق بخطوتين',
      phone_verification: 'تأكيد رقم الهاتف',
    };

    await this.mailerService.sendMail({
      to: email,
      subject: `${subjectMap[data.verificationType]} - ${templateData.appName}`,
      template: 'verification-code', // This refers to verification-code.hbs
      context: templateData,
    });
  }

  /**
   * Send email verification code
   */
  async sendEmailVerificationCode(
    email: string,
    userName: string,
    code: string,
    expiryMinutes: number = 15,
    ipAddress?: string,
  ): Promise<void> {
    await this.sendVerificationEmail(email, {
      userName,
      verificationCode: code,
      verificationType: 'email_verification',
      expiryMinutes,
      ipAddress,
    });
  }

  /**
   * Send password reset code
   */
  async sendPasswordResetCode(
    email: string,
    userName: string,
    code: string,
    expiryMinutes: number = 30,
    ipAddress?: string,
  ): Promise<void> {
    await this.sendVerificationEmail(email, {
      userName,
      verificationCode: code,
      verificationType: 'password_reset',
      expiryMinutes,
      ipAddress,
    });
  }

  /**
   * Send 2FA verification code
   */
  async send2FACode(
    email: string,
    userName: string,
    code: string,
    expiryMinutes: number = 5,
    ipAddress?: string,
  ): Promise<void> {
    await this.sendVerificationEmail(email, {
      userName,
      verificationCode: code,
      verificationType: '2fa',
      expiryMinutes,
      ipAddress,
    });
  }

  /**
   * Send plain email (fallback method)
   */
  async sendPlainEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      html,
      text,
    });
  }
}
