import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { type AuthUser } from 'src/auth/auth-user.interface';
import { GameSummaryDto } from 'src/games/dtos/game-summary.dto';
import { GameDetailsDto } from 'src/games/dtos/game-details.dto';
import { GameHandDto } from 'src/games/dtos/game-hand.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser) {
    return this.gamesService.createGame(user.sub);
  }

  @Get(':id/join')
  public async joinGame(@Param('id') gameId: string, @CurrentUser() user: AuthUser): Promise<GameDetailsDto> {
    return this.gamesService.joinGame(gameId, user.sub);
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

  @Get(':id/hand')
  public async getHand(@Param('id') gameId: string, @CurrentUser() user: AuthUser): Promise<GameHandDto> {
    return this.gamesService.getHand(gameId, user.sub);
  }
}
