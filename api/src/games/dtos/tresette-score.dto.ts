export interface TresetteTeamScoreDetails {
  readonly userIds: string[];
  readonly cardPointsThirds: number;
  readonly lastTrickBonus: boolean;
  readonly accusePoints: number;
  readonly totalThirds: number;
  readonly totalPoints: string;
}

export interface TresetteScoreResult {
  readonly type: 'tresette';
  readonly teamA: TresetteTeamScoreDetails;
  readonly teamB: TresetteTeamScoreDetails;
}
