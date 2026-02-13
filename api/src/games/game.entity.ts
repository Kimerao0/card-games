import { CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, JoinTable, UpdateDateColumn, Column } from 'typeorm';
import { User } from 'src/users/user.entity';
import { GameStatus } from 'src/games/game-status.enum';
import { OneToMany } from 'typeorm';
import { GameParticipant } from './game-player.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  createdBy!: User;

  // creator + fino a 3 altri = max 4 players (la regola la facciamo nel service)
  @ManyToMany(() => User)
  @JoinTable({
    name: 'game_players',
    joinColumn: { name: 'game_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  players!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.Created,
  })
  status: GameStatus;

  @OneToMany(() => GameParticipant, (gp) => gp.game, { cascade: true })
  public gamePlayers: GameParticipant[];
}
