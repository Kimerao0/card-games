import type { IUser } from '@/dtos/User';

export interface TeamScoreDetails {
  readonly userIds: string[];
  readonly points: number;
  readonly details: {
    readonly carte: boolean;
    readonly denari: boolean;
    readonly settebello: boolean;
    readonly primiera: boolean;
    readonly scope: number;
  };
}

export interface ScoponeScoreResult {
  readonly teamA: TeamScoreDetails;
  readonly teamB: TeamScoreDetails;
}

export type TGameStatus = 'Created' | 'Ready' | 'Progress' | 'Scoring' | 'Completed';
export type TGameType = 'ScoponeScientifico' | 'Tresette';

export interface IGameDetailsDto {
  readonly id: string;
  readonly status: TGameStatus;
  readonly gameType: TGameType;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
  readonly playersCount: number;
  readonly maxPlayers: number;
}

export interface IGameSummaryDto {
  readonly id: string;
  readonly status: TGameStatus;
  readonly gameType: TGameType;
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

export interface IGamePlayerDto {
  readonly userId: string;
  readonly name: string;
}

export interface IGameCreatedResponse {
  readonly id: string;
  readonly status: TGameStatus;
  readonly gameType: TGameType;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: IUser;
  readonly gamePlayers: IGameParticipant[];
}

// NEW: stato “live” della partita (per polling)
export interface IGameStateDto {
  readonly id: string;
  readonly status: TGameStatus;
  readonly gameType: TGameType;

  readonly startingPlayerIndex: number | null;
  readonly currentPlayerIndex: number | null;

  readonly tableCardIds: number[];
  readonly trickCardIds: number[];
  readonly trickPlayerIds: string[];

  readonly capturedCardIdsByUser: Record<string, number[]>;

  readonly scopasByUser: Record<string, number>;
  readonly scoreResult: ScoponeScoreResult | null;
}
