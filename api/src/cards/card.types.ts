export type TCardColors = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface ICard {
  readonly id: number;
  readonly value: number;
  readonly color: TCardColors;
}
