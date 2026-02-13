import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { AuthConfig } from 'src/config/auth.config';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const auth = config.get<AuthConfig>('auth');
        if (!auth?.jwt?.secret || !auth?.jwt?.expiresIn) {
          throw new Error('Missing auth config (JWT_SECRET / JWT_EXPIRES_IN)');
        }

        return {
          secret: auth.jwt.secret,
          signOptions: { expiresIn: auth.jwt.expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
