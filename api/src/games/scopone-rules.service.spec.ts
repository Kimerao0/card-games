import { ConflictException } from '@nestjs/common';

import { ScoponeRulesService } from './scopone-rules.service';

describe('ScoponeRulesService', () => {
  let service: ScoponeRulesService;

  beforeEach(() => {
    service = new ScoponeRulesService();
  });

  describe('getCardValue', () => {
    it('returns 1 for card id 1 (asso di denari)', () => {
      expect(service.getCardValue(1)).toBe(1);
    });

    it('returns 7 for card id 7 (settebello — sette di denari)', () => {
      expect(service.getCardValue(7)).toBe(7);
    });

    it('returns 7 for card id 17 (sette di coppe)', () => {
      expect(service.getCardValue(17)).toBe(7);
    });

    it('returns 10 for card id 40 (dieci di bastoni)', () => {
      expect(service.getCardValue(40)).toBe(10);
    });

    it('throws ConflictException for unknown id 0', () => {
      expect(() => service.getCardValue(0)).toThrow(ConflictException);
    });

    it('throws ConflictException for unknown id 41', () => {
      expect(() => service.getCardValue(41)).toThrow(ConflictException);
    });
  });

  describe('getCardColor', () => {
    it('returns diamonds for id 1', () => {
      expect(service.getCardColor(1)).toBe('diamonds');
    });

    it('returns hearts for id 11', () => {
      expect(service.getCardColor(11)).toBe('hearts');
    });

    it('returns spades for id 21', () => {
      expect(service.getCardColor(21)).toBe('spades');
    });

    it('returns clubs for id 31', () => {
      expect(service.getCardColor(31)).toBe('clubs');
    });

    it('throws ConflictException for unknown id', () => {
      expect(() => service.getCardColor(99)).toThrow(ConflictException);
    });
  });

  describe('findScoponeCapture', () => {
    it('returns empty array when table is empty', () => {
      expect(service.findScoponeCapture([], 7)).toEqual([]);
    });

    it('returns empty array when no combination matches', () => {
      // table has id 1 (value 1) and id 2 (value 2); play value 9 → 1+2=3, no match
      expect(service.findScoponeCapture([1, 2], 9)).toEqual([]);
    });

    it('prefers exact single-card match over multi-card sum', () => {
      // table has id 7 (value 7) and ids 3 (value 3) + 4 (value 4); play value 7
      // exact match wins: returns [7]
      expect(service.findScoponeCapture([7, 3, 4], 7)).toEqual([7]);
    });

    it('returns 2-card combo when no exact match exists', () => {
      // table: id 3 (value 3), id 4 (value 4); play value 7 → 3+4=7
      expect(service.findScoponeCapture([3, 4], 7)).toEqual([3, 4]);
    });

    it('prefers fewest-cards combo (2-card beats 3-card with same sum)', () => {
      // table: id 2 (v2), id 4 (v4), id 1 (v1), id 2? — need distinct ids
      // id 2 (v2) + id 4 (v4) = 6 (2 cards)
      // id 1 (v1) + id 2 (v2) + id 3 (v3) = 6 (3 cards)
      // play value 6 → 2-card combo [2, 4] should win
      expect(service.findScoponeCapture([2, 4, 1, 3], 6)).toEqual([2, 4]);
    });

    it('tie-breaks on sum of ids (lower sum wins)', () => {
      // id 1 (v1) + id 6 (v6) → sum ids = 7
      // id 2 (v2) + id 5 (v5) → sum ids = 7 — tie, then lexicographic
      // id 1 (v1) + id 6 (v6): sorted [1,6]; id 2 (v2) + id 5 (v5): sorted [2,5]
      // Compare first element: 1 < 2 → [1, 6] wins
      // play value 7
      expect(service.findScoponeCapture([1, 2, 5, 6], 7)).toEqual([1, 6]);
    });
  });

  describe('calculateScoponeScore', () => {
    const makeParticipant = (userId: string) => ({ userId } as any);

    it('awards settebello to the team that captured card id 7', () => {
      const participants = [makeParticipant('a'), makeParticipant('b'), makeParticipant('c'), makeParticipant('d')];
      const game = {
        capturedCardIdsByUser: {
          a: [7, 1, 11, 21], // team A has settebello
          b: [2, 12, 22, 32],
          c: [3, 13, 23, 33],
          d: [4, 14, 24, 34],
        },
        scopasByUser: { a: 0, b: 0, c: 0, d: 0 },
      } as any;

      const result = service.calculateScoponeScore(game, participants);
      expect(result.teamA.details.settebello).toBe(true);
      expect(result.teamB.details.settebello).toBe(false);
    });

    it('awards carte point to team with more captured cards', () => {
      const participants = [makeParticipant('a'), makeParticipant('b'), makeParticipant('c'), makeParticipant('d')];
      // team A: 25 cards, team B: 15 cards
      const teamACards = Array.from({ length: 25 }, (_, i) => i + 1);
      const teamBCards = Array.from({ length: 15 }, (_, i) => i + 26);
      const game = {
        capturedCardIdsByUser: {
          a: teamACards,
          b: teamBCards.slice(0, 8),
          c: [],
          d: teamBCards.slice(8),
        },
        scopasByUser: { a: 0, b: 0, c: 0, d: 0 },
      } as any;

      const result = service.calculateScoponeScore(game, participants);
      expect(result.teamA.details.carte).toBe(true);
      expect(result.teamB.details.carte).toBe(false);
    });

    it('counts scope correctly per team', () => {
      const participants = [makeParticipant('a'), makeParticipant('b'), makeParticipant('c'), makeParticipant('d')];
      const game = {
        capturedCardIdsByUser: { a: [], b: [], c: [], d: [] },
        scopasByUser: { a: 2, b: 1, c: 1, d: 0 },
      } as any;

      const result = service.calculateScoponeScore(game, participants);
      // team A = a(2) + c(1) = 3, team B = b(1) + d(0) = 1
      expect(result.teamA.details.scope).toBe(3);
      expect(result.teamB.details.scope).toBe(1);
    });
  });
});
