import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/dto/create-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
      ],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // profile contains user's Google profile info
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      avatar: photos[0].value,
      googleId: profile.id,
      phoneNumber: profile?._json?.phoneNumbers?.[0]?.value || null,
      isVerified: true,
      isActive: true,
      role: UserRole.CUSTOMER,
    };
    const savedUser = await this.usersService.getUserByEmail(user.email);
    if (!savedUser) {
      // If user does not exist, create a new user
      const createdUser = await this.usersService.createUser(user);
      return done(null, createdUser);
    }

    done(null, user);
  }
}
