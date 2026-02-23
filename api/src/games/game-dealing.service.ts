import { ConflictException, Injectable } from '@nestjs/common';

import { ALL_CARDS } from 'src/cards/all-cards.const';
import { shuffle } from 'src/cards/shuffle.util';
import { GameParticipant } from 'src/games/game-player.entity';
import { GameType } from 'src/games/game-type.enum';

const MAX_PLAYERS: number = 4;

@Injectable()
export class GameDealingService {
  public dealForGameType(gameType: GameType): { hands: number[][]; tableCardIds: number[] } {
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

  public initCapturedByUser(participants: GameParticipant[]): Record<string, number[]> {
    const captured: Record<string, number[]> = {};
    for (const p of participants) {
      captured[p.userId] = [];
    }
    return captured;
  }

  public initScopasByUser(participants: GameParticipant[]): Record<string, number> {
    const scopas: Record<string, number> = {};
    for (const p of participants) scopas[p.userId] = 0;
    return scopas;
  }

  public pickRandomStartingIndex(maxPlayers: number): number {
    return Math.floor(Math.random() * maxPlayers);
  }
}
