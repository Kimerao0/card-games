import { GameDealingService } from './game-dealing.service';
import { GameType } from './game-type.enum';

describe('GameDealingService', () => {
  let service: GameDealingService;

  beforeEach(() => {
    service = new GameDealingService();
  });

  describe('dealForGameType', () => {
    it('deals 4 hands of 10 cards for ScoponeScientifico', () => {
      const result = service.dealForGameType(GameType.ScoponeScientifico);
      expect(result.hands).toHaveLength(4);
      for (const hand of result.hands) {
        expect(hand).toHaveLength(10);
      }
    });

    it('deals empty tableCardIds for ScoponeScientifico', () => {
      const result = service.dealForGameType(GameType.ScoponeScientifico);
      expect(result.tableCardIds).toEqual([]);
    });

    it('deals 4 hands of 10 cards for Tresette', () => {
      const result = service.dealForGameType(GameType.Tresette);
      expect(result.hands).toHaveLength(4);
      for (const hand of result.hands) {
        expect(hand).toHaveLength(10);
      }
    });

    it('contains no duplicate card ids across all hands', () => {
      const result = service.dealForGameType(GameType.ScoponeScientifico);
      const allCards = result.hands.flat();
      const uniqueCards = new Set(allCards);
      expect(uniqueCards.size).toBe(allCards.length);
    });

    it('distributes exactly 40 cards in total', () => {
      const result = service.dealForGameType(GameType.ScoponeScientifico);
      const allCards = result.hands.flat();
      expect(allCards).toHaveLength(40);
    });
  });

  describe('initCapturedByUser', () => {
    it('initializes empty array for each participant', () => {
      const participants = [{ userId: 'user1' }, { userId: 'user2' }] as any[];
      const result = service.initCapturedByUser(participants);
      expect(result).toEqual({ user1: [], user2: [] });
    });

    it('returns empty object for empty participants', () => {
      expect(service.initCapturedByUser([])).toEqual({});
    });
  });

  describe('initScopasByUser', () => {
    it('initializes 0 for each participant', () => {
      const participants = [{ userId: 'user1' }, { userId: 'user2' }] as any[];
      const result = service.initScopasByUser(participants);
      expect(result).toEqual({ user1: 0, user2: 0 });
    });

    it('returns empty object for empty participants', () => {
      expect(service.initScopasByUser([])).toEqual({});
    });
  });

  describe('pickRandomStartingIndex', () => {
    it('returns an integer in [0, maxPlayers) across 100 calls', () => {
      for (let i = 0; i < 100; i += 1) {
        const index = service.pickRandomStartingIndex(4);
        expect(Number.isInteger(index)).toBe(true);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(4);
      }
    });
  });
});
