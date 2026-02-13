import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'src/config/auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const auth = configService.get<AuthConfig>('auth')!;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: auth.jwt.secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
