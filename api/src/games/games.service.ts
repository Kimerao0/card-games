import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepo: Repository<Game>,
    private readonly usersService: UsersService,
  ) {}

  async createGame(creatorId: string): Promise<Game> {
    const creator = await this.usersService.findOneById(creatorId);
    if (!creator) throw new NotFoundException('User not found');

    const game = this.gamesRepo.create({
      createdBy: creator,
      players: [creator],
    });

    return this.gamesRepo.save(game);
  }

  async joinGame(gameId: string, userId: string): Promise<Game> {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const game = await this.gamesRepo.findOne({
      where: { id: gameId },
      relations: { players: true, createdBy: true },
    });
    if (!game) throw new NotFoundException('Game not found');

    const alreadyIn = game.players.some((p) => p.id === user.id);
    if (alreadyIn) return game;

    if (game.players.length >= 4) {
      throw new BadRequestException('Game is full');
    }

    game.players.push(user);
    return this.gamesRepo.save(game);
  }

  async deleteGame(gameId: string, userId: string): Promise<void> {
    const game = await this.gamesRepo.findOne({
      where: { id: gameId },
      relations: { createdBy: true },
    });

    if (!game) throw new NotFoundException('Game not found');

    if (game.createdBy.id !== userId) {
      throw new ForbiddenException('Only the creator can delete this game');
    }

    await this.gamesRepo.remove(game);
  }
}
