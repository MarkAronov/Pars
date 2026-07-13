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
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { twoFactor } from 'better-auth/plugins';
import type { Db } from 'mongodb';
import type { DrizzleDb } from '../database/drizzle';

type AuthInstance = ReturnType<typeof betterAuth>;
let _auth: AuthInstance | null = null;

// Ported from backend-nestjs/src/api/auth/auth.config.ts — every non-obvious
// constraint documented there (additionalFields for role, nested password
// hasher, generateId for Mongo _id parity, ignoreUndefined-adjacent Mongo
// footguns) applies identically here; the config itself is framework-
// agnostic, only the DI wrapper differs.
export function initAuth(
	drizzleDb: DrizzleDb | null,
	mongoDb: Db | null,
): AuthInstance {
	const database =
		process.env.DATABASE_DRIVER === 'mongo'
			? mongodbAdapter(mongoDb as Db, {
					client: (mongoDb as Db).client,
					transaction: true,
				})
			: drizzleAdapter(drizzleDb as DrizzleDb, {
					provider: 'pg',
					schema: {
						user: users,
						session: sessions,
						account: accounts,
						verification: verifications,
						twoFactor: twoFactors,
					},
				});

	const instance = betterAuth({
		database,
		user: {
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
			password: {
				hash: (password: string) => argon2.hash(password),
				verify: ({ hash, password }: { hash: string; password: string }) =>
					argon2.verify(hash, password),
			},
		},
		plugins: [twoFactor()],
		session: {
			cookieCache: {
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
			database: {
				generateId: () => crypto.randomUUID(),
			},
		},
	}) as unknown as AuthInstance;
	_auth = instance;
	return instance;
}

export function getAuth(): AuthInstance {
	if (!_auth) throw new Error('Auth not initialized — call initAuth first');
	return _auth;
}
