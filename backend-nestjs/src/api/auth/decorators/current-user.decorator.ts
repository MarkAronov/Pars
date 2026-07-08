import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest<Request & { user: unknown }>();
		return req.user;
	},
);
