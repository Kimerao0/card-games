import { registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: StringValue | number;
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '60m') as StringValue,
    },
  }),
);
