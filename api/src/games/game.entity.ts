import { CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, JoinTable, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/user.entity';

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
}
