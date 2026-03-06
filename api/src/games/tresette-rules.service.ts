import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ALL_CARDS } from 'src/cards/all-cards.const';
import { TCardColors } from 'src/cards/card.types';
import { Game } from 'src/games/game.entity';
import { GameParticipant } from 'src/games/game-player.entity';
import { GameStatus } from 'src/games/game-status.enum';
import { TresetteScoreResult, TresetteTeamScoreDetails } from 'src/games/dtos/tresette-score.dto';

/**
 * Ranking del Tresette (da più alto a più basso):
 * 3 > 2 > Asso(1) > Re(10) > Cavallo(9) > Fante(8) > 7 > 6 > 5 > 4
 */
const TRESETTE_RANK: Record<number, number> = {
  3: 10,
  2: 9,
  1: 8,
  10: 7,
  9: 6,
  8: 5,
  7: 4,
  6: 3,
  5: 2,
  4: 1,
};

/**
 * Punti delle carte in terzi (1 punto = 3 terzi):
 * - Asso: 3 terzi (= 1 punto)
 * - 2, 3, Fante(8), Cavallo(9), Re(10): 1 terzo ciascuno (= 1/3 punto)
 * - 4, 5, 6, 7: 0 terzi (lisci)
 */
const CARD_POINT_THIRDS: Record<number, number> = {
  1: 3,
  2: 1,
  3: 1,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 1,
  9: 1,
  10: 1,
};

const LAST_TRICK_BONUS_THIRDS: number = 3;

@Injectable()
export class TresetteRulesService {
  public getCardValue(cardId: number): number {
    const card = ALL_CARDS.find((c) => c.id === cardId);
    if (!card) {
      throw new ConflictException('Unknown card id');
    }
    return card.value;
  }

  public getCardSuit(cardId: number): TCardColors {
    const card = ALL_CARDS.find((c) => c.id === cardId);
    if (!card) {
      throw new ConflictException('Unknown card id');
    }
    return card.color;
  }

  /**
   * Ritorna il seme della prima carta giocata nel trick (seme di mano).
   * Se il trick è vuoto, ritorna null.
   */
  public getLeadSuit(trickCardIds: number[]): TCardColors | null {
    if (trickCardIds.length === 0) return null;
    return this.getCardSuit(trickCardIds[0]);
  }

  /**
   * Valida se il giocatore può giocare la carta data, rispettando l'obbligo
   * di rispondere al seme di mano.
   *
   * Regola: se il giocatore ha carte del seme di mano, DEVE giocarne una.
   */
  public validateSuitFollowing(cardId: number, handCardIds: number[], trickCardIds: number[]): void {
    const leadSuit = this.getLeadSuit(trickCardIds);
    if (leadSuit === null) return; // primo giocatore del trick, può giocare qualsiasi carta

    const playedSuit = this.getCardSuit(cardId);
    if (playedSuit === leadSuit) return; // sta rispondendo al seme, ok

    // Verifica se ha carte del seme di mano
    const hasLeadSuit = handCardIds.some((id) => this.getCardSuit(id) === leadSuit);
    if (hasLeadSuit) {
      throw new ConflictException('Devi rispondere al seme di mano');
    }
    // Non ha carte del seme, può giocare qualsiasi carta
  }

  /**
   * Determina il vincitore del trick (4 carte giocate).
   * Vince la carta più alta del seme di mano. Carte fuori seme non possono vincere.
   *
   * Ritorna l'indice (0-3) nel trick del vincitore.
   */
  public determineTrickWinnerIndex(trickCardIds: number[]): number {
    if (trickCardIds.length !== 4) {
      throw new ConflictException('Trick must have exactly 4 cards');
    }

    const leadSuit = this.getCardSuit(trickCardIds[0]);

    let bestIndex = 0;
    let bestRank = TRESETTE_RANK[this.getCardValue(trickCardIds[0])];

    for (let i = 1; i < 4; i += 1) {
      const cardSuit = this.getCardSuit(trickCardIds[i]);
      if (cardSuit !== leadSuit) continue; // fuori seme, non può vincere

      const rank = TRESETTE_RANK[this.getCardValue(trickCardIds[i])];
      if (rank > bestRank) {
        bestRank = rank;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  /**
   * Calcola i punti in terzi delle carte catturate.
   */
  public calculateCardPointsThirds(cardIds: number[]): number {
    let total = 0;
    for (const id of cardIds) {
      const value = this.getCardValue(id);
      total += CARD_POINT_THIRDS[value] ?? 0;
    }
    return total;
  }

  /**
   * Rileva gli accusi nella mano di un giocatore.
   *
   * - Bongioco: tre carte dello stesso valore (solo tra 1, 2, 3) = 3 punti (9 terzi)
   * - Napoletana: Asso + 2 + 3 dello stesso seme = 3 punti (9 terzi)
   *
   * Ritorna il totale in terzi dei bonus accusi.
   */
  public detectAccuseThirds(handCardIds: number[]): number {
    let totalThirds = 0;
    const suits: TCardColors[] = ['diamonds', 'hearts', 'spades', 'clubs'];

    // Bongioco: tre carte dello stesso valore tra 1, 2, 3
    for (const targetValue of [1, 2, 3]) {
      const cardsOfValue = handCardIds.filter((id) => this.getCardValue(id) === targetValue);
      if (cardsOfValue.length >= 3) {
        totalThirds += 9; // 3 punti
      }
    }

    // Napoletana: Asso + 2 + 3 dello stesso seme
    for (const suit of suits) {
      const suitCardIds = handCardIds.filter((id) => this.getCardSuit(id) === suit);
      const suitValues = suitCardIds.map((id) => this.getCardValue(id));
      if (suitValues.includes(1) && suitValues.includes(2) && suitValues.includes(3)) {
        totalThirds += 9; // 3 punti
      }
    }

    return totalThirds;
  }

  /**
   * Formatta i terzi in stringa leggibile (es. "5 + 1/3", "11 + 2/3", "7").
   */
  public formatThirdsAsPoints(thirds: number): string {
    const wholePoints = Math.floor(thirds / 3);
    const remainder = thirds % 3;
    if (remainder === 0) return String(wholePoints);
    return `${wholePoints} + ${remainder}/3`;
  }

  /**
   * Calcola il punteggio finale di una partita di Tresette.
   *
   * Squadre: Team A = giocatori[0] e giocatori[2], Team B = giocatori[1] e giocatori[3].
   */
  public calculateTresetteScore(game: Game, participants: GameParticipant[]): TresetteScoreResult {
    const teamAIds: string[] = [participants[0].userId, participants[2].userId];
    const teamBIds: string[] = [participants[1].userId, participants[3].userId];

    const capturedByUser: Record<string, number[]> = game.capturedCardIdsByUser ?? {};
    const accuseByUser: Record<string, number> = game.scopasByUser ?? {};

    const teamACards: number[] = [...(capturedByUser[teamAIds[0]] ?? []), ...(capturedByUser[teamAIds[1]] ?? [])];
    const teamBCards: number[] = [...(capturedByUser[teamBIds[0]] ?? []), ...(capturedByUser[teamBIds[1]] ?? [])];

    const cardPointsA: number = this.calculateCardPointsThirds(teamACards);
    const cardPointsB: number = this.calculateCardPointsThirds(teamBCards);

    // Bonus ultima presa: va alla squadra che ha vinto l'ultimo trick
    const lastCaptureUserId = game.lastCaptureUserId;
    const lastTrickA: boolean = lastCaptureUserId !== null && teamAIds.includes(lastCaptureUserId);
    const lastTrickB: boolean = lastCaptureUserId !== null && teamBIds.includes(lastCaptureUserId);

    // Accusi: somma dei bonus di ciascun giocatore della squadra
    const accuseA: number = (accuseByUser[teamAIds[0]] ?? 0) + (accuseByUser[teamAIds[1]] ?? 0);
    const accuseB: number = (accuseByUser[teamBIds[0]] ?? 0) + (accuseByUser[teamBIds[1]] ?? 0);

    const totalThirdsA: number = cardPointsA + (lastTrickA ? LAST_TRICK_BONUS_THIRDS : 0) + accuseA;
    const totalThirdsB: number = cardPointsB + (lastTrickB ? LAST_TRICK_BONUS_THIRDS : 0) + accuseB;

    const teamA: TresetteTeamScoreDetails = {
      userIds: teamAIds,
      cardPointsThirds: cardPointsA,
      lastTrickBonus: lastTrickA,
      accusePoints: Math.floor(accuseA / 3),
      totalThirds: totalThirdsA,
      totalPoints: this.formatThirdsAsPoints(totalThirdsA),
    };

    const teamB: TresetteTeamScoreDetails = {
      userIds: teamBIds,
      cardPointsThirds: cardPointsB,
      lastTrickBonus: lastTrickB,
      accusePoints: Math.floor(accuseB / 3),
      totalThirds: totalThirdsB,
      totalPoints: this.formatThirdsAsPoints(totalThirdsB),
    };

    return { type: 'tresette', teamA, teamB };
  }

  /**
   * Gestisce la fine della partita: calcola il punteggio e aggiorna lo stato.
   */
  public async handleGameEnd(game: Game, participants: GameParticipant[], manager: EntityManager): Promise<void> {
    game.scoreResult = this.calculateTresetteScore(game, participants);
    game.status = GameStatus.Scoring;
    await manager.getRepository(Game).save(game);
  }
}
