import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { UsersService } from 'src/users/users.service';
import { GameSummaryDto } from 'src/games/dtos/game-summary.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly usersService: UsersService,
  ) {}

  async createGame(creatorId: string): Promise<Game> {
    const creator = await this.usersService.findOneById(creatorId);
    if (!creator) throw new NotFoundException('User not found');

    const game = this.gamesRepository.create({
      createdBy: creator,
      players: [creator],
    });

    return this.gamesRepository.save(game);
  }

  async joinGame(gameId: string, userId: string): Promise<Game> {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: { players: true, createdBy: true },
    });
    if (!game) throw new NotFoundException('Game not found');

    const alreadyIn = game.players.some((p) => p.id === user.id);
    if (alreadyIn) return game;

    if (game.players.length >= 4) {
      throw new BadRequestException('Game is full');
    }

    game.players.push(user);
    return this.gamesRepository.save(game);
  }

  async deleteGame(gameId: string, userId: string): Promise<void> {
    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: { createdBy: true },
    });

    if (!game) throw new NotFoundException('Game not found');

    if (game.createdBy.id !== userId) {
      throw new ForbiddenException('Only the creator can delete this game');
    }

    await this.gamesRepository.remove(game);
  }

  public async listGames(userId: string): Promise<GameSummaryDto[]> {
    const games = await this.gamesRepository.find({
      relations: {
        createdBy: true,
        players: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return games.map((game) => {
      const isUserInGame = game.players.some((player) => player.id === userId);

      return {
        id: game.id,
        createdAt: game.createdAt.toISOString(),
        updatedAt: game.updatedAt.toISOString(),
        createdByUserId: game.createdBy.id,
        playersCount: game.players.length,
        maxPlayers: 4,
        isUserInGame,
      };
    });
  }
}
