import type { IUser } from '@/dtos/User';

export interface ILoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface IRegisterRequest {
  readonly email: string;
  readonly name: string;
  readonly password: string;
}

export interface IAuthResponse {
  readonly user: IUser;
  readonly accessToken: string;
}
