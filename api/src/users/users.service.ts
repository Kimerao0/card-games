import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from 'src/users/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  public findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({
      email,
      name,
      passwordHash,
    });

    return this.usersRepo.save(user);
  }

  public async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
