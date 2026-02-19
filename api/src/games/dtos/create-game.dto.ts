import { IsEnum } from 'class-validator';
import { GameType } from 'src/games/game-type.enum';

export class CreateGameDto {
  @IsEnum(GameType)
  gameType: GameType;
}
