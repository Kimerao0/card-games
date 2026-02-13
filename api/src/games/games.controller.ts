import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { type AuthUser } from 'src/auth/auth-user.interface';
import { GameSummaryDto } from 'src/games/dtos/game-summary.dto';

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

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.gamesService.deleteGame(id, user.sub);
  }

  @Get()
  public async listGames(@CurrentUser() user: AuthUser): Promise<GameSummaryDto[]> {
    return this.gamesService.listGames(user.sub);
  }
}
