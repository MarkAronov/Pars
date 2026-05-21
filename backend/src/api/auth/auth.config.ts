import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';
import * as argon2 from 'argon2';
import type { PrismaService } from '../../database/prisma.service';

type AuthInstance = ReturnType<typeof betterAuth>;
let _auth: AuthInstance | null = null;

export function initAuth(prisma: PrismaService): AuthInstance {
	_auth = betterAuth({
		database: prismaAdapter(prisma as unknown as Parameters<typeof prismaAdapter>[0], {
			provider: 'postgresql',
		}),
		emailAndPassword: {
			enabled: true,
		},
		plugins: [twoFactor()],
		secret: process.env.SESSION_SECRET ?? 'change-me-in-production-32-chars!!',
		trustedOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(','),
		advanced: {
			cookiePrefix: 'pars',
		},
		password: {
			hash: (password) => argon2.hash(password),
			verify: ({ hash, password }) => argon2.verify(hash, password),
		},
	});
	return _auth;
}

export function getAuth(): AuthInstance {
	if (!_auth) throw new Error('Auth not initialized — call initAuth first');
	return _auth;
}
