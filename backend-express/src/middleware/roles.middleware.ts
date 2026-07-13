import { ForbiddenException } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { AuthedRequest } from './session.middleware';

// Same logic as backend-nestjs's RolesGuard, as plain middleware — must run
// after requireSession, since it reads req.user set there.
export const requireRole =
	(...roles: string[]) =>
	(req: AuthedRequest, _res: Response, next: NextFunction) => {
		if (!roles.includes(req.user?.role ?? '')) {
			next(new ForbiddenException('Insufficient role'));
			return;
		}
		next();
	};
