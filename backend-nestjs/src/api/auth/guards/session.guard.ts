import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { getAuth } from '../auth.config';

@Injectable()
export class SessionAuthGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Request>();
		const auth = getAuth();

		const session = await auth.api.getSession({
			headers: new Headers(req.headers as Record<string, string>),
		});

		if (!session?.user) {
			throw new UnauthorizedException();
		}

		(req as Request & { user: unknown; sessionId: string }).user = session.user;
		(req as Request & { user: unknown; sessionId: string }).sessionId =
			session.session.id;

		return true;
	}
}
