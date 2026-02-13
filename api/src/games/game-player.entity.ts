import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { Game } from './game.entity';
import { User } from 'src/users/user.entity';

@Entity({ name: 'game_participants' })
export class GameParticipant {
  @PrimaryColumn('uuid')
  public gameId: string;

  @PrimaryColumn('uuid')
  public userId: string;

  @ManyToOne(() => Game, (game) => game.gamePlayers, {
    onDelete: 'CASCADE',
  })
  public game: Game;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public user: User;

  @Column('int', { array: true, nullable: true })
  public handCardIds: number[] | null;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
