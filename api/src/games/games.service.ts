import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { ALL_CARDS } from 'src/cards/all-cards.const';
import { TCardColors } from 'src/cards/card.types';
import { shuffle } from 'src/cards/shuffle.util';
import { GameDetailsDto } from 'src/games/dtos/game-details.dto';
import { GamePlayerDto } from 'src/games/dtos/game-player.dto';
import { GameSummaryDto } from 'src/games/dtos/game-summary.dto';
import { GameStatus } from 'src/games/game-status.enum';
import { GameType } from 'src/games/game-type.enum';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

import { Game } from './game.entity';
import { GameParticipant } from 'src/games/game-player.entity';
import { GameHandDto } from 'src/games/dtos/game-hand.dto';
import { ScoponeScoreResult } from 'src/games/dtos/game-score.dto';
import { GameStateDto } from 'src/games/dtos/game-state.dto';

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
        const deal = this.dealForGameType(lockedGame.gameType);

        for (let i = 0; i < MAX_PLAYERS; i += 1) {
          updatedParticipants[i].handCardIds = deal.hands[i];
        }
        await participantRepository.save(updatedParticipants);

        const startingIndex: number = this.pickRandomStartingIndex(MAX_PLAYERS);

        lockedGame.startingPlayerIndex = startingIndex;
        lockedGame.currentPlayerIndex = startingIndex;

        lockedGame.trickCardIds = [];
        lockedGame.trickPlayerIds = [];

        lockedGame.tableCardIds = deal.tableCardIds;

        lockedGame.capturedCardIdsByUser = this.initCapturedByUser(updatedParticipants);

        lockedGame.scopasByUser = this.initScopasByUser(updatedParticipants);
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

  private pickRandomStartingIndex(maxPlayers: number): number {
    return Math.floor(Math.random() * maxPlayers);
  }

  private dealHands(): number[][] {
    const shuffledDeck = shuffle(ALL_CARDS);
    const cardIds: number[] = shuffledDeck.map((c) => c.id);

    const expectedTotalCards: number = MAX_PLAYERS * HAND_SIZE;
    if (cardIds.length !== expectedTotalCards) {
      throw new ConflictException('Invalid deck size');
    }

    const hands: number[][] = [];
    for (let i = 0; i < MAX_PLAYERS; i += 1) {
      const sliceStart: number = i * HAND_SIZE;
      const sliceEnd: number = sliceStart + HAND_SIZE;
      hands.push(cardIds.slice(sliceStart, sliceEnd));
    }

    return hands;
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

  private initCapturedByUser(participants: GameParticipant[]): Record<string, number[]> {
    const captured: Record<string, number[]> = {};
    for (const p of participants) {
      captured[p.userId] = [];
    }
    return captured;
  }

  private initScopasByUser(participants: GameParticipant[]): Record<string, number> {
    const scopas: Record<string, number> = {};
    for (const p of participants) scopas[p.userId] = 0;
    return scopas;
  }

  private dealForGameType(gameType: GameType): { hands: number[][]; tableCardIds: number[] } {
    // Scopone scientifico: 10 carte a testa, 0 sul tavolo
    // Tressette: 10 carte a testa, 0 sul tavolo
    const handSize: number = 10;
    const tableSize: number = 0;

    const shuffledDeck = shuffle(ALL_CARDS);
    const cardIds: number[] = shuffledDeck.map((c) => c.id);

    const expectedTotalCards: number = MAX_PLAYERS * handSize + tableSize;
    if (cardIds.length !== expectedTotalCards) {
      throw new ConflictException('Invalid deck size for game type');
    }

    const hands: number[][] = [];
    let cursor = 0;

    for (let i = 0; i < MAX_PLAYERS; i += 1) {
      hands.push(cardIds.slice(cursor, cursor + handSize));
      cursor += handSize;
    }

    const tableCardIds: number[] = []; // sempre vuoto all'inizio

    return { hands, tableCardIds };
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
        const playedValue: number = this.getCardValue(cardId);

        const capture = this.findScoponeCapture(tableIds, playedValue);

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
        await this.handleGameEnd(lockedGame, participants, manager);
      }
    });
  }

  private getCardValue(cardId: number): number {
    const card = ALL_CARDS.find((c) => c.id === cardId);
    if (!card) {
      throw new ConflictException('Unknown card id');
    }

    // Assunzione: c.value o c.rank è già 1..10 (asso=1)
    // Se nel tuo modello si chiama diversamente, cambia QUI soltanto.
    const value = (card as any).value ?? (card as any).rank;

    if (typeof value !== 'number' || value < 1 || value > 10) {
      throw new ConflictException('Invalid card value');
    }

    return value;
  }

  private findScoponeCapture(tableCardIds: number[], playedValue: number): number[] {
    if (tableCardIds.length === 0) return [];

    // 1) Precedenza: carta esatta per valore
    for (const id of tableCardIds) {
      if (this.getCardValue(id) === playedValue) {
        return [id];
      }
    }

    // 2) Altrimenti: combinazioni che sommano al valore giocato
    // Generiamo tutte le combinazioni e scegliamo:
    // - prima: quella con meno carte
    // - poi: tie-break deterministico (somma id, poi lessicografico)
    const values = tableCardIds.map((id) => ({ id, v: this.getCardValue(id) }));

    const combos: number[][] = [];
    const n = values.length;

    const dfs = (start: number, remaining: number, acc: number[]) => {
      if (remaining === 0) {
        combos.push([...acc]);
        return;
      }
      if (remaining < 0) return;

      for (let i = start; i < n; i += 1) {
        const { id, v } = values[i];
        acc.push(id);
        dfs(i + 1, remaining - v, acc);
        acc.pop();
      }
    };

    dfs(0, playedValue, []);

    if (combos.length === 0) return [];

    combos.sort((a, b) => {
      // fewer cards first
      if (a.length !== b.length) return a.length - b.length;

      // tie-break 1: sum of ids
      const sa = a.reduce((s, x) => s + x, 0);
      const sb = b.reduce((s, x) => s + x, 0);
      if (sa !== sb) return sa - sb;

      // tie-break 2: lexicographic
      const aa = [...a].sort((x, y) => x - y);
      const bb = [...b].sort((x, y) => x - y);
      for (let i = 0; i < Math.min(aa.length, bb.length); i += 1) {
        if (aa[i] !== bb[i]) return aa[i] - bb[i];
      }
      return 0;
    });

    return combos[0];
  }

  private async handleGameEnd(game: Game, participants: GameParticipant[], manager: EntityManager): Promise<void> {
    // Remaining table cards go to last capturer (not a scopa — just cleanup)
    if ((game.tableCardIds?.length ?? 0) > 0 && game.lastCaptureUserId !== null) {
      if (game.capturedCardIdsByUser === null) game.capturedCardIdsByUser = {};
      if (!game.capturedCardIdsByUser[game.lastCaptureUserId]) {
        game.capturedCardIdsByUser[game.lastCaptureUserId] = [];
      }
      game.capturedCardIdsByUser[game.lastCaptureUserId].push(...(game.tableCardIds ?? []));
      game.tableCardIds = [];
    }

    game.scoreResult = this.calculateScoponeScore(game, participants);
    game.status = GameStatus.Scoring;
    await manager.getRepository(Game).save(game);
  }

  private calculateScoponeScore(game: Game, participants: GameParticipant[]): ScoponeScoreResult {
    const teamAIds: string[] = [participants[0].userId, participants[2].userId];
    const teamBIds: string[] = [participants[1].userId, participants[3].userId];
    const capturedByUser: Record<string, number[]> = game.capturedCardIdsByUser ?? {};

    const teamACards: number[] = [...(capturedByUser[teamAIds[0]] ?? []), ...(capturedByUser[teamAIds[1]] ?? [])];
    const teamBCards: number[] = [...(capturedByUser[teamBIds[0]] ?? []), ...(capturedByUser[teamBIds[1]] ?? [])];

    const carteA: boolean = teamACards.length > teamBCards.length;
    const carteB: boolean = teamBCards.length > teamACards.length;

    const denariA: number = teamACards.filter((id) => this.getCardColor(id) === 'diamonds').length;
    const denariB: number = teamBCards.filter((id) => this.getCardColor(id) === 'diamonds').length;
    const denariWinA: boolean = denariA > denariB;
    const denariWinB: boolean = denariB > denariA;

    const settebelloA: boolean = teamACards.includes(7);
    const settebelloB: boolean = teamBCards.includes(7);

    const primA: number = this.getPrimieraScore(teamACards);
    const primB: number = this.getPrimieraScore(teamBCards);
    const primieraA: boolean = primA > primB;
    const primieraB: boolean = primB > primA;

    const scopasByUser: Record<string, number> = game.scopasByUser ?? {};
    const scopeA: number = (scopasByUser[teamAIds[0]] ?? 0) + (scopasByUser[teamAIds[1]] ?? 0);
    const scopeB: number = (scopasByUser[teamBIds[0]] ?? 0) + (scopasByUser[teamBIds[1]] ?? 0);

    const pointsA: number = (carteA ? 1 : 0) + (denariWinA ? 1 : 0) + (settebelloA ? 1 : 0) + (primieraA ? 1 : 0) + scopeA;
    const pointsB: number = (carteB ? 1 : 0) + (denariWinB ? 1 : 0) + (settebelloB ? 1 : 0) + (primieraB ? 1 : 0) + scopeB;

    return {
      teamA: {
        userIds: teamAIds,
        points: pointsA,
        details: { carte: carteA, denari: denariWinA, settebello: settebelloA, primiera: primieraA, scope: scopeA },
      },
      teamB: {
        userIds: teamBIds,
        points: pointsB,
        details: { carte: carteB, denari: denariWinB, settebello: settebelloB, primiera: primieraB, scope: scopeB },
      },
    };
  }

  private getPrimieraScore(cardIds: number[]): number {
    const PRIMIERA_VALUES: Record<number, number> = { 7: 21, 6: 18, 1: 16, 5: 15, 4: 14, 3: 13, 2: 12, 8: 10, 9: 10, 10: 10 };
    const suits: TCardColors[] = ['diamonds', 'hearts', 'spades', 'clubs'];
    let total: number = 0;

    for (const suit of suits) {
      const suitCards: number[] = cardIds.filter((id) => this.getCardColor(id) === suit);
      if (suitCards.length === 0) return 0; // missing a suit → primiera score is 0
      const best: number = Math.max(...suitCards.map((id) => PRIMIERA_VALUES[this.getCardValue(id)] ?? 0));
      total += best;
    }

    return total;
  }

  private getCardColor(cardId: number): TCardColors {
    const card = ALL_CARDS.find((c) => c.id === cardId);
    if (!card) {
      throw new ConflictException('Unknown card id');
    }
    return card.color;
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
