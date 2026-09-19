import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Pulls the userId stashed on the request by JwtAuthGuard. */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId as string;
  },
);
