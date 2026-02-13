import { Controller, Get, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/users/user.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { type AuthUser } from 'src/auth/auth-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async profile(@CurrentUser() user: AuthUser): Promise<User> {
    const dbUser = await this.usersService.findOneById(user.sub);

    if (!dbUser) {
      throw new NotFoundException();
    }

    return dbUser;
  }
}
