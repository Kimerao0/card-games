import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

import { appConfigSchema } from './config/config.types';
import { typeOrmConfig } from './config/database.config';
import { authConfig } from './config/auth.config';
import { appConfig } from './config/app.config';
import { TypedConfigService } from './config/typed-config.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: appConfigSchema,
      load: [appConfig, typeOrmConfig, authConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database')!,
    }),

    AuthModule,

    UsersModule,
  ],
  providers: [
    { provide: TypedConfigService, useExisting: ConfigService },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
