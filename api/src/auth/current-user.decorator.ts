import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from './auth.request';

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<AuthRequest>();
  return req.user;
});
