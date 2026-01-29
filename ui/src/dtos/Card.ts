export interface ICard {
  id: number;
  value: number;
  color: TCardColors;
}

export type TCardColors = 'spades' | 'hearts' | 'diamonds' | 'clubs';
