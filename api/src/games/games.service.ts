import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { GameSummaryDto } from 'src/games/dtos/game-summary.dto';
import { GameStatus } from 'src/games/game-status.enum';
import { Game } from './game.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

const MAX_PLAYERS: number = 4;

@Injectable()
export class GamesService {
  public constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly usersService: UsersService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  public async createGame(creatorId: string): Promise<Game> {
    const creator: User | null = await this.usersService.findOneById(creatorId);
    if (creator === null) {
      throw new NotFoundException('User not found');
    }

    const game: Game = this.gamesRepository.create({
      createdBy: creator,
      players: [creator],
      status: GameStatus.Created,
    });

    return this.gamesRepository.save(game);
  }

  public async joinGame(gameId: string, userId: string): Promise<Game> {
    return this.dataSource.transaction(async (manager) => {
      const gameRepository: Repository<Game> = manager.getRepository(Game);
      const userRepository: Repository<User> = manager.getRepository(User);

      // 1) Lock ONLY the Game row (no relations!) to avoid Postgres FOR UPDATE + LEFT JOIN error
      const lockedGame: Game | null = await gameRepository.findOne({
        where: { id: gameId },
        lock: { mode: 'pessimistic_write' },
      });

      if (lockedGame === null) {
        throw new NotFoundException('Game not found');
      }

      // 2) Load current players separately (relations query must NOT be locked)
      const gameWithPlayers: Game | null = await gameRepository.findOne({
        where: { id: gameId },
        relations: { players: true },
      });

      if (gameWithPlayers === null) {
        throw new NotFoundException('Game not found');
      }

      const user: User | null = await userRepository.findOne({
        where: { id: userId },
      });

      if (user === null) {
        throw new NotFoundException('User not found');
      }

      const isAlreadyPlayer: boolean = gameWithPlayers.players.some((p) => p.id === userId);
      if (isAlreadyPlayer) {
        return gameWithPlayers;
      }

      if (gameWithPlayers.players.length >= MAX_PLAYERS) {
        throw new ConflictException('Game is full');
      }

      // Apply the update to the locked entity to keep the write safe
      lockedGame.players = [...gameWithPlayers.players, user];

      if (lockedGame.players.length === MAX_PLAYERS && lockedGame.status === GameStatus.Created) {
        lockedGame.status = GameStatus.Ready;
      }

      return gameRepository.save(lockedGame);
    });
  }

  public async deleteGame(gameId: string, userId: string): Promise<void> {
    const game: Game | null = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: { createdBy: true },
    });

    if (game === null) {
      throw new NotFoundException('Game not found');
    }

    if (game.createdBy.id !== userId) {
      throw new ForbiddenException('Only the creator can delete this game');
    }

    await this.gamesRepository.remove(game);
  }

  public async listGames(userId: string): Promise<GameSummaryDto[]> {
    const games: Game[] = await this.gamesRepository.find({
      relations: {
        createdBy: true,
        players: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return games.map((game): GameSummaryDto => {
      const isUserInGame: boolean = game.players.some((player) => player.id === userId);

      return {
        id: game.id,
        createdAt: game.createdAt.toISOString(),
        updatedAt: game.updatedAt.toISOString(),
        createdByUserId: game.createdBy.id,
        playersCount: game.players.length,
        maxPlayers: MAX_PLAYERS,
        isUserInGame,
      };
    });
  }
}
