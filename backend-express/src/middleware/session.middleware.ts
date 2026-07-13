import { UnauthorizedException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { getAuth } from '../auth/auth.config';

export interface AuthedRequest extends Request {
	user?: { id: string; role: string };
	sessionId?: string;
}

// Same logic as backend-nestjs's SessionAuthGuard, as plain middleware —
// framework-agnostic already, just needed the decorator syntax removed.
export const requireSession = async (
	req: AuthedRequest,
	_res: Response,
	next: NextFunction,
) => {
	const auth = getAuth();
	const session = await auth.api.getSession({
		headers: new Headers(req.headers as Record<string, string>),
	});

	if (!session?.user) {
		next(new UnauthorizedException());
		return;
	}

	// better-auth's static session type doesn't know about the `role`
	// additionalField, so the underlying object needs an unknown-first cast.
	req.user = session.user as unknown as { id: string; role: string };
	req.sessionId = session.session.id;
	next();
};
