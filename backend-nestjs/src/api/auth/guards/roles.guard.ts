import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!required?.length) return true;

		const { user } = context
			.switchToHttp()
			.getRequest<{ user: { role: string } }>();
		if (!required.includes(user?.role)) {
			throw new ForbiddenException('Insufficient role');
		}
		return true;
	}
}
