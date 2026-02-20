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
