import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(dto: CreateUserDto): Promise<{ accessToken: string }> {
    const existing = await this.usersService.findOneByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const user = await this.usersService.createUser(dto);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }

  public async login(dto: { email: string; password: string }): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await this.usersService.verifyPassword(user, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
