import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { type AuthUser } from 'src/auth/auth-user.interface';
import { GameSummaryDto } from 'src/games/dtos/game-summary.dto';
import { GameDetailsDto } from 'src/games/dtos/game-details.dto';
import { GameHandDto } from 'src/games/dtos/game-hand.dto';
import { GamePlayerDto } from 'src/games/dtos/game-player.dto';
import { CreateGameDto } from 'src/games/dtos/create-game.dto';
import { PlayCardDto } from 'src/games/dtos/play-card.dto';
import { GameStateDto } from 'src/games/dtos/game-state.dto';

@Controller('games')
export class GamesController {
  public constructor(private readonly gamesService: GamesService) {}

  @Post()
  public create(@Body() dto: CreateGameDto, @CurrentUser() user: AuthUser): Promise<unknown> {
    return this.gamesService.createGame(user.sub, dto.gameType);
  }

  @Get(':id/join')
  public async joinGame(@Param('id') gameId: string, @CurrentUser() user: AuthUser): Promise<GameDetailsDto> {
    return this.gamesService.joinGame(gameId, user.sub);
  }

  @Post(':id/play')
  public async playCard(@Param('id') gameId: string, @Body() dto: PlayCardDto, @CurrentUser() user: AuthUser): Promise<void> {
    await this.gamesService.playCard(gameId, user.sub, dto.cardId);
  }

  // NEW: game state for polling clients
  @Get(':id/state')
  public async getState(@Param('id') gameId: string, @CurrentUser() user: AuthUser): Promise<GameStateDto> {
    return this.gamesService.getGameState(gameId, user.sub);
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

  @Get(':id')
  public async getGame(@Param('id') gameId: string, @CurrentUser() user: AuthUser): Promise<GameSummaryDto> {
    return this.gamesService.getGame(gameId, user.sub);
  }

  @Get(':id/players')
  public async getPlayers(@Param('id') gameId: string): Promise<GamePlayerDto[]> {
    return this.gamesService.getPlayers(gameId);
  }
}
