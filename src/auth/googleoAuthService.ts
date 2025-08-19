import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { ConfigServiceType } from 'src/common/config/config.type';

@Injectable()
export class GoogleOAuthService {
  private oauth2Client;

  constructor(
    private readonly configService: ConfigService<ConfigServiceType>,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_CALLBACK_URL'),
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
      ],
      prompt: 'consent',
    });
  }
}
