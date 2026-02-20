import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { ALL_CARDS } from 'src/cards/all-cards.const';
import { shuffle } from 'src/cards/shuffle.util';
import { GameDetailsDto } from 'src/games/dtos/game-details.dto';
import { GameSummaryDto } from 'src/games/dtos/game-summary.dto';
import { GameStatus } from 'src/games/game-status.enum';
import { GameType } from 'src/games/game-type.enum';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

import { Game } from './game.entity';
import { GameParticipant } from 'src/games/game-player.entity';
import { GameHandDto } from 'src/games/dtos/game-hand.dto';

const MAX_PLAYERS: number = 4;
const HAND_SIZE: number = 10;

@Injectable()
export class GamesService {
  public constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly usersService: UsersService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  public async createGame(creatorId: string, gameType: GameType): Promise<Game> {
    const creator: User | null = await this.usersService.findOneById(creatorId);
    if (creator === null) {
      throw new NotFoundException('User not found');
    }

    const participantRepository: Repository<GameParticipant> = this.dataSource.getRepository(GameParticipant);

    const participant: GameParticipant = participantRepository.create({
      user: creator,
      userId: creator.id,
      handCardIds: null,
    });

    const game: Game = this.gamesRepository.create({
      createdBy: creator,
      status: GameStatus.Created,
      gameType,
      gamePlayers: [participant],
    });

    return this.gamesRepository.save(game);
  }

  public async joinGame(gameId: string, userId: string): Promise<GameDetailsDto> {
    return this.dataSource.transaction(async (manager) => {
      const gameRepository: Repository<Game> = manager.getRepository(Game);
      const participantRepository: Repository<GameParticipant> = manager.getRepository(GameParticipant);
      const userRepository: Repository<User> = manager.getRepository(User);

      // 1) Lock ONLY the Game row (no relations) to avoid Postgres FOR UPDATE + LEFT JOIN error
      const lockedGame: Game | null = await gameRepository.findOne({
        where: { id: gameId },
        lock: { mode: 'pessimistic_write' },
      });

      if (lockedGame === null) {
        throw new NotFoundException('Game not found');
      }

      const user: User | null = await userRepository.findOne({
        where: { id: userId },
      });

      if (user === null) {
        throw new NotFoundException('User not found');
      }

      const existingParticipants: GameParticipant[] = await participantRepository.find({
        where: { gameId },
        select: {
          gameId: true,
          userId: true,
          handCardIds: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const isAlreadyParticipant: boolean = existingParticipants.some((p) => p.userId === userId);

      if (!isAlreadyParticipant) {
        if (existingParticipants.length >= MAX_PLAYERS) {
          throw new ConflictException('Game is full');
        }

        const newParticipant: GameParticipant = participantRepository.create({
          game: lockedGame,
          gameId: lockedGame.id,
          user,
          userId: user.id,
          handCardIds: null,
        });

        await participantRepository.save(newParticipant);
      }

      // Reload participants after insert (still inside the transaction)
      const updatedParticipants: GameParticipant[] = await participantRepository.find({
        where: { gameId },
        order: { createdAt: 'ASC' }, // deterministic dealing order
      });

      // If we reached 4 participants, shuffle + deal once
      const shouldDeal: boolean = updatedParticipants.length === MAX_PLAYERS && lockedGame.status === GameStatus.Created;

      if (shouldDeal) {
        const shuffledDeck = shuffle(ALL_CARDS);
        const cardIds: number[] = shuffledDeck.map((c) => c.id);

        const expectedTotalCards: number = MAX_PLAYERS * HAND_SIZE;
        if (cardIds.length !== expectedTotalCards) {
          throw new ConflictException('Invalid deck size');
        }

        for (let i = 0; i < MAX_PLAYERS; i += 1) {
          const sliceStart: number = i * HAND_SIZE;
          const sliceEnd: number = sliceStart + HAND_SIZE;

          updatedParticipants[i].handCardIds = cardIds.slice(sliceStart, sliceEnd);
        }

        await participantRepository.save(updatedParticipants);

        lockedGame.status = GameStatus.Ready;
        await gameRepository.save(lockedGame);
      }

      const gameWithCreator: Game | null = await gameRepository.findOne({
        where: { id: lockedGame.id },
        relations: { createdBy: true },
      });

      if (gameWithCreator === null) {
        throw new NotFoundException('Game not found');
      }

      const finalParticipantsCount: number = await participantRepository.count({
        where: { gameId: lockedGame.id },
      });

      return {
        id: gameWithCreator.id,
        status: gameWithCreator.status,
        gameType: gameWithCreator.gameType,
        createdAt: gameWithCreator.createdAt.toISOString(),
        updatedAt: gameWithCreator.updatedAt.toISOString(),
        createdByUserId: gameWithCreator.createdBy.id,
        playersCount: finalParticipantsCount,
        maxPlayers: MAX_PLAYERS,
      };
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
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const gameIds: string[] = games.map((g) => g.id);
    if (gameIds.length === 0) {
      return [];
    }

    const participants: GameParticipant[] = await this.dataSource.getRepository(GameParticipant).find({
      where: { gameId: In(gameIds) },
      select: {
        gameId: true,
        userId: true,
      },
    });

    const playersCountByGameId: Map<string, number> = new Map();
    const isUserInGameByGameId: Map<string, boolean> = new Map();

    for (const p of participants) {
      playersCountByGameId.set(p.gameId, (playersCountByGameId.get(p.gameId) ?? 0) + 1);

      if (p.userId === userId) {
        isUserInGameByGameId.set(p.gameId, true);
      }
    }

    return games.map((game): GameSummaryDto => {
      const playersCount: number = playersCountByGameId.get(game.id) ?? 0;
      const isUserInGame: boolean = isUserInGameByGameId.get(game.id) ?? false;

      return {
        id: game.id,
        status: game.status,
        gameType: game.gameType,
        createdAt: game.createdAt.toISOString(),
        updatedAt: game.updatedAt.toISOString(),
        createdByUserId: game.createdBy.id,
        playersCount,
        maxPlayers: MAX_PLAYERS,
        isUserInGame,
      };
    });
  }

  public async getGame(gameId: string, userId: string): Promise<GameSummaryDto> {
    const game: Game | null = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: { createdBy: true },
    });

    if (game === null) {
      throw new NotFoundException('Game not found');
    }

    const participantRepository: Repository<GameParticipant> = this.dataSource.getRepository(GameParticipant);

    const playersCount: number = await participantRepository.count({ where: { gameId } });

    const participantEntry: GameParticipant | null = await participantRepository.findOne({
      where: { gameId, userId },
      select: { gameId: true, userId: true },
    });

    const isUserInGame: boolean = participantEntry !== null;

    return {
      id: game.id,
      status: game.status,
      gameType: game.gameType,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
      createdByUserId: game.createdBy.id,
      playersCount,
      maxPlayers: MAX_PLAYERS,
      isUserInGame,
    };
  }

  public async getHand(gameId: string, userId: string): Promise<GameHandDto> {
    const participant: GameParticipant | null = await this.dataSource.getRepository(GameParticipant).findOne({
      where: { gameId, userId },
      select: {
        gameId: true,
        userId: true,
        handCardIds: true,
      },
    });

    if (participant === null) {
      throw new NotFoundException('Player not found in game');
    }

    const handCardIds: number[] = participant.handCardIds ?? [];

    return {
      gameId: participant.gameId,
      userId: participant.userId,
      handCardIds,
    };
  }
}
