import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from 'src/users/users.service';

import { GameDealingService } from './game-dealing.service';
import { Game } from './game.entity';
import { GamesService } from './games.service';
import { ScoponeRulesService } from './scopone-rules.service';

describe('GamesService', () => {
  let service: GamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        ScoponeRulesService,
        GameDealingService,
        { provide: getRepositoryToken(Game), useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: getDataSourceToken(), useValue: {} },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
