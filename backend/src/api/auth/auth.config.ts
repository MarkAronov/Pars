import * as argon2 from 'argon2';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import type { DrizzleService } from '../../database/drizzle.service';

type AuthInstance = ReturnType<typeof betterAuth>;
let _auth: AuthInstance | null = null;

export function initAuth(drizzle: DrizzleService): AuthInstance {
	const instance = betterAuth({
		database: drizzleAdapter(drizzle.db, { provider: 'pg' }),
		emailAndPassword: {
			enabled: true,
		},
		plugins: [twoFactor()],
		secret: process.env.SESSION_SECRET ?? 'change-me-in-production-32-chars!!',
		trustedOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(
			',',
		),
		advanced: {
			cookiePrefix: 'pars',
		},
		password: {
			hash: (password: string) => argon2.hash(password),
			verify: ({ hash, password }: { hash: string; password: string }) =>
				argon2.verify(hash, password),
		},
	}) as unknown as AuthInstance;
	_auth = instance;
	return instance;
}

export function getAuth(): AuthInstance {
	if (!_auth) throw new Error('Auth not initialized — call initAuth first');
	return _auth;
}
