import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { GameDetailsDto } from 'src/games/dtos/game-details.dto';
import { GameHandDto } from 'src/games/dtos/game-hand.dto';
import { GamePlayerDto } from 'src/games/dtos/game-player.dto';
import { GameStateDto } from 'src/games/dtos/game-state.dto';
import { GameSummaryDto } from 'src/games/dtos/game-summary.dto';
import { GameStatus } from 'src/games/game-status.enum';
import { GameType } from 'src/games/game-type.enum';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

import { GameDealingService } from './game-dealing.service';
import { Game } from './game.entity';
import { GameParticipant } from 'src/games/game-player.entity';
import { ScoponeRulesService } from './scopone-rules.service';

const MAX_PLAYERS: number = 4;

@Injectable()
export class GamesService {
  public constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    private readonly usersService: UsersService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly scoponeRules: ScoponeRulesService,
    private readonly gameDealing: GameDealingService,
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

      const lockedGame: Game | null = await gameRepository.findOne({
        where: { id: gameId },
        lock: { mode: 'pessimistic_write' },
      });

      if (lockedGame === null) {
        throw new NotFoundException('Game not found');
      }

      const user: User | null = await userRepository.findOne({ where: { id: userId } });
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

      const updatedParticipants: GameParticipant[] = await participantRepository.find({
        where: { gameId },
        order: { createdAt: 'ASC' },
      });

      const shouldDeal: boolean = updatedParticipants.length === MAX_PLAYERS && lockedGame.status === GameStatus.Created;

      if (shouldDeal) {
        const deal = this.gameDealing.dealForGameType(lockedGame.gameType);

        for (let i = 0; i < MAX_PLAYERS; i += 1) {
          updatedParticipants[i].handCardIds = deal.hands[i];
        }
        await participantRepository.save(updatedParticipants);

        const startingIndex: number = this.gameDealing.pickRandomStartingIndex(MAX_PLAYERS);

        lockedGame.startingPlayerIndex = startingIndex;
        lockedGame.currentPlayerIndex = startingIndex;

        lockedGame.trickCardIds = [];
        lockedGame.trickPlayerIds = [];

        lockedGame.tableCardIds = deal.tableCardIds;

        lockedGame.capturedCardIdsByUser = this.gameDealing.initCapturedByUser(updatedParticipants);

        lockedGame.scopasByUser = this.gameDealing.initScopasByUser(updatedParticipants);
        lockedGame.lastCaptureUserId = null;
        lockedGame.scoreResult = null;

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

  public async getPlayers(gameId: string): Promise<GamePlayerDto[]> {
    const game: Game | null = await this.gamesRepository.findOne({ where: { id: gameId } });
    if (game === null) {
      throw new NotFoundException('Game not found');
    }

    const participants: GameParticipant[] = await this.dataSource.getRepository(GameParticipant).find({
      where: { gameId },
      order: { createdAt: 'ASC' },
    });

    return participants.map(
      (p): GamePlayerDto => ({
        userId: p.userId,
        name: p.user.name,
      }),
    );
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

  public async playCard(gameId: string, userId: string, cardId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const gameRepository: Repository<Game> = manager.getRepository(Game);
      const participantRepository: Repository<GameParticipant> = manager.getRepository(GameParticipant);

      // Lock game row
      const lockedGame: Game | null = await gameRepository.findOne({
        where: { id: gameId },
        lock: { mode: 'pessimistic_write' },
      });

      if (lockedGame === null) {
        throw new NotFoundException('Game not found');
      }

      if (lockedGame.status !== GameStatus.Ready) {
        throw new ConflictException('Game is not ready');
      }

      if (lockedGame.currentPlayerIndex === null || lockedGame.startingPlayerIndex === null) {
        throw new ConflictException('Turn state not initialized');
      }

      const participants: GameParticipant[] = await participantRepository.find({
        where: { gameId },
        order: { createdAt: 'ASC' },
      });

      if (participants.length !== MAX_PLAYERS) {
        throw new ConflictException('Game does not have 4 players');
      }

      const currentPlayer: GameParticipant = participants[lockedGame.currentPlayerIndex];

      if (currentPlayer.userId !== userId) {
        throw new ConflictException('Not your turn');
      }

      if (currentPlayer.handCardIds === null) {
        throw new ConflictException('Hand not initialized');
      }

      if (!currentPlayer.handCardIds.includes(cardId)) {
        throw new ConflictException('Card not in hand');
      }

      // Remove from hand (always)
      currentPlayer.handCardIds = currentPlayer.handCardIds.filter((id) => id !== cardId);

      // Ensure arrays/maps are initialized
      if (lockedGame.trickCardIds === null) lockedGame.trickCardIds = [];
      if (lockedGame.trickPlayerIds === null) lockedGame.trickPlayerIds = [];

      if (lockedGame.tableCardIds === null) lockedGame.tableCardIds = [];
      if (lockedGame.capturedCardIdsByUser === null) {
        // fallback safe init (should be already set in joinGame)
        lockedGame.capturedCardIdsByUser = {};
        for (const p of participants) lockedGame.capturedCardIdsByUser[p.userId] = [];
      }
      if (lockedGame.capturedCardIdsByUser[userId] === undefined) {
        lockedGame.capturedCardIdsByUser[userId] = [];
      }

      // Log play (useful for UI/history; for Scopone not used for scoring directly)
      lockedGame.trickCardIds.push(cardId);
      lockedGame.trickPlayerIds.push(userId);

      // --- Game-specific resolution ---
      if (lockedGame.gameType === GameType.ScoponeScientifico) {
        const tableIds: number[] = lockedGame.tableCardIds;
        const playedValue: number = this.scoponeRules.getCardValue(cardId);

        const capture = this.scoponeRules.findScoponeCapture(tableIds, playedValue);

        if (capture.length > 0) {
          // Capture: remove captured cards from table, add captured + played to user's captured pile
          lockedGame.tableCardIds = tableIds.filter((id) => !capture.includes(id));
          lockedGame.capturedCardIdsByUser[userId].push(cardId, ...capture);
          lockedGame.lastCaptureUserId = userId;

          // Fare scopa: table is now empty after capture
          if (lockedGame.tableCardIds.length === 0) {
            if (lockedGame.scopasByUser === null) lockedGame.scopasByUser = {};
            lockedGame.scopasByUser[userId] = (lockedGame.scopasByUser[userId] ?? 0) + 1;
          }
        } else {
          // No capture: card goes to table
          lockedGame.tableCardIds.push(cardId);
        }
      } else {
        // Tressette (placeholder for now): no table/capture logic here
        // We'll do trick resolution in a later step specific to Tressette.
      }

      await participantRepository.save(currentPlayer);

      // Advance turn round-robin
      lockedGame.currentPlayerIndex = (lockedGame.currentPlayerIndex + 1) % MAX_PLAYERS;

      await gameRepository.save(lockedGame);

      // Check if the game has ended (all hands empty)
      const allHandsEmpty: boolean = participants.every((p) => (p.handCardIds ?? []).length === 0);
      if (allHandsEmpty) {
        await this.scoponeRules.handleGameEnd(lockedGame, participants, manager);
      }
    });
  }

  public async getGameState(gameId: string, userId: string): Promise<GameStateDto> {
    const gameRepository: Repository<Game> = this.dataSource.getRepository(Game);
    const participantRepository: Repository<GameParticipant> = this.dataSource.getRepository(GameParticipant);

    const game: Game | null = await gameRepository.findOne({ where: { id: gameId } });
    if (game === null) {
      throw new NotFoundException('Game not found');
    }

    // Optional: ensure caller is a participant
    const isParticipant = (await participantRepository.count({ where: { gameId, userId } })) > 0;
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant');
    }

    return {
      id: game.id,
      status: game.status,
      gameType: game.gameType,
      startingPlayerIndex: game.startingPlayerIndex ?? null,
      currentPlayerIndex: game.currentPlayerIndex ?? null,
      tableCardIds: game.tableCardIds ?? [],
      trickCardIds: game.trickCardIds ?? [],
      trickPlayerIds: game.trickPlayerIds ?? [],
      capturedCardIdsByUser: game.capturedCardIdsByUser ?? {},
      scopasByUser: game.scopasByUser ?? {},
      scoreResult: game.scoreResult ?? null,
    };
  }
}
