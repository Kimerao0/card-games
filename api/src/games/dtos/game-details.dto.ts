import { GameType } from 'src/games/game-type.enum';

export interface GameDetailsDto {
  readonly id: string;
  readonly status: string;
  readonly gameType: GameType;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
  readonly playersCount: number;
  readonly maxPlayers: number;
}
