import {
	accounts,
	sessions,
	twoFactors,
	users,
	verifications,
} from '@pars/db-adapters/schema';
import * as argon2 from 'argon2';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import type { DrizzleService } from '../../database/drizzle.service';

type AuthInstance = ReturnType<typeof betterAuth>;
let _auth: AuthInstance | null = null;

export function initAuth(drizzle: DrizzleService): AuthInstance {
	const instance = betterAuth({
		database: drizzleAdapter(drizzle.db, {
			provider: 'pg',
			schema: {
				user: users,
				session: sessions,
				account: accounts,
				verification: verifications,
				twoFactor: twoFactors,
			},
		}),
		user: {
			// Without this, better-auth strips any DB column it doesn't know
			// about from session.user — RolesGuard reads req.user.role from
			// exactly that object, so every @Roles()-gated endpoint always saw
			// role === undefined and rejected regardless of the DB value.
			additionalFields: {
				role: {
					type: 'string',
					required: false,
					defaultValue: 'user',
					input: false,
				},
			},
		},
		emailAndPassword: {
			enabled: true,
			// Must nest here, not top-level `password` — better-auth reads the
			// custom hasher from emailAndPassword.password, and silently falls
			// back to its own default hasher otherwise, which then mismatches
			// UserService's direct argon2.verify() calls on the stored hash
			// (packages/db-adapters/src/services/user.service.ts).
			password: {
				hash: (password: string) => argon2.hash(password),
				verify: ({ hash, password }: { hash: string; password: string }) =>
					argon2.verify(hash, password),
			},
		},
		plugins: [twoFactor()],
		session: {
			cookieCache: {
				// Disabled in tests: role changes are applied directly via Drizzle
				// (no promote-to-admin endpoint exists), and the cache — keyed off
				// data captured at session-creation time — otherwise keeps guards
				// seeing the pre-promotion role for up to maxAge, independent of
				// when the DB write happens relative to sign-in.
				enabled: process.env.NODE_ENV !== 'test',
				maxAge: 60,
			},
		},
		secret: process.env.SESSION_SECRET ?? 'change-me-in-production-32-chars!!',
		trustedOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(
			',',
		),
		advanced: {
			cookiePrefix: 'pars',
		},
	}) as unknown as AuthInstance;
	_auth = instance;
	return instance;
}

export function getAuth(): AuthInstance {
	if (!_auth) throw new Error('Auth not initialized — call initAuth first');
	return _auth;
}
