import { Controller, Get, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { type AuthUser } from 'src/auth/auth-user.interface';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser) {
    return this.gamesService.createGame(user.sub);
  }

  @Get(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.gamesService.joinGame(id, user.sub);
  }
}
