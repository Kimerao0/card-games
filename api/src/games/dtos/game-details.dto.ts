export interface GameDetailsDto {
  readonly id: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
  readonly playersCount: number;
  readonly maxPlayers: number;
}
