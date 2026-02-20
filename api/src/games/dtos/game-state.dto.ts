import { GameStatus } from 'src/games/game-status.enum';
import { GameType } from 'src/games/game-type.enum';
import { ScoponeScoreResult } from './game-score.dto';

export class GameStateDto {
  id!: string;
  status!: GameStatus;
  gameType!: GameType;

  startingPlayerIndex!: number | null;
  currentPlayerIndex!: number | null;

  tableCardIds!: number[];
  trickCardIds!: number[];
  trickPlayerIds!: string[];

  capturedCardIdsByUser!: Record<string, number[]>;

  scopasByUser!: Record<string, number>;
  scoreResult!: ScoponeScoreResult | null;
}
