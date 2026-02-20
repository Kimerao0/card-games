import { IsInt, Min } from 'class-validator';

export class PlayCardDto {
  @IsInt()
  @Min(1)
  cardId!: number;
}
