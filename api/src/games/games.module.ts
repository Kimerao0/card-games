import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { Game } from './game.entity';
import { UsersModule } from '../users/users.module';
import { GameParticipant } from 'src/games/game-player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, GameParticipant]), UsersModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
