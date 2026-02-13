import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypedConfigService } from 'src/config/typed-config.service';
import { AuthConfig } from 'src/config/auth.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => {
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
