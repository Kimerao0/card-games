import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/user.entity';
import { GameStatus } from 'src/games/game-status.enum';
import { GameType } from 'src/games/game-type.enum';
import { GameParticipant } from './game-player.entity';
import { ScoponeScoreResult } from './dtos/game-score.dto';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  createdBy!: User;

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

  @Column({ type: 'enum', enum: GameType })
  gameType: GameType;

  @Column({ type: 'int', nullable: true })
  startingPlayerIndex!: number | null;

  @Column({ type: 'int', nullable: true })
  currentPlayerIndex!: number | null;

  @Column({ type: 'int', array: true, nullable: true })
  trickCardIds!: number[] | null;

  @Column({ type: 'uuid', array: true, nullable: true })
  trickPlayerIds!: string[] | null;

  @Column({ type: 'int', array: true, nullable: true })
  tableCardIds!: number[] | null;

  @Column({ type: 'jsonb', nullable: true })
  capturedCardIdsByUser!: Record<string, number[]> | null;

  @Column({ type: 'jsonb', nullable: true })
  scopasByUser!: Record<string, number> | null;

  @Column({ type: 'uuid', nullable: true })
  lastCaptureUserId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  scoreResult!: ScoponeScoreResult | null;

  @OneToMany(() => GameParticipant, (gp) => gp.game, { cascade: true })
  public gamePlayers: GameParticipant[];
}
