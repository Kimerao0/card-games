import type { IUser } from '@/dtos/User';

export type TGameStatus = 'Created' | 'Ready' | 'Progress' | 'Scoring' | 'Completed';

export interface IGameDetailsDto {
  readonly id: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
  readonly playersCount: number;
  readonly maxPlayers: number;
}

export interface IGameSummaryDto {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
  readonly playersCount: number;
  readonly maxPlayers: number;
  readonly isUserInGame: boolean;
}

export interface IGameHandDto {
  readonly gameId: string;
  readonly userId: string;
  readonly handCardIds: number[];
}

export interface IGameParticipant {
  readonly gameId: string;
  readonly userId: string;
  readonly handCardIds: number[] | null;
}

export interface IGameCreatedResponse {
  readonly id: string;
  readonly status: TGameStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: IUser;
  readonly gamePlayers: IGameParticipant[];
}
