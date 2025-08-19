import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { SignInDto } from '../dtos/sign-in.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  logger = new Logger(LocalStrategy.name);
  constructor(private readonly usersService: UsersService) {
    super({ usernameField: 'email' });
    this.logger.log('from strategy validate');
    console.log('first log from local strategy');
  }

  validate(data: SignInDto): Promise<User> {
    this.logger.log('from strategy validate');
    return this.usersService.validateUser(data.email);
  }
}
