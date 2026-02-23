import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ALL_CARDS } from 'src/cards/all-cards.const';
import { TCardColors } from 'src/cards/card.types';
import { ScoponeScoreResult } from 'src/games/dtos/game-score.dto';
import { Game } from 'src/games/game.entity';
import { GameParticipant } from 'src/games/game-player.entity';
import { GameStatus } from 'src/games/game-status.enum';

@Injectable()
export class ScoponeRulesService {
  public getCardValue(cardId: number): number {
    const card = ALL_CARDS.find((c) => c.id === cardId);
    if (!card) {
      throw new ConflictException('Unknown card id');
    }

    const value: number = card.value;

    if (typeof value !== 'number' || value < 1 || value > 10) {
      throw new ConflictException('Invalid card value');
    }

    return value;
  }

  public getCardColor(cardId: number): TCardColors {
    const card = ALL_CARDS.find((c) => c.id === cardId);
    if (!card) {
      throw new ConflictException('Unknown card id');
    }
    return card.color;
  }

  public findScoponeCapture(tableCardIds: number[], playedValue: number): number[] {
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

  public async handleGameEnd(game: Game, participants: GameParticipant[], manager: EntityManager): Promise<void> {
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

  public calculateScoponeScore(game: Game, participants: GameParticipant[]): ScoponeScoreResult {
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
}
