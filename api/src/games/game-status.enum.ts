export enum GameStatus {
  Created = 'Created',
  Ready = 'Ready',
  Progress = 'Progress',
  Scoring = 'Scoring',
  Completed = 'Completed',
}

/* 
1: Created (once its created, default) 
2: Ready (when the fourth player join) 
3: Progress (when the first player plays one card) 
4: Scoring (when the last player plays its last card) 
5: Completed (when the last players leaves the game) 
*/
