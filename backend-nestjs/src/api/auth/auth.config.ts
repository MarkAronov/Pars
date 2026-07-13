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
import type { DrizzleService } from '../../database/drizzle.service';
import type { MongoService } from '../../database/mongo.service';

type AuthInstance = ReturnType<typeof betterAuth>;
let _auth: AuthInstance | null = null;

export function initAuth(
	drizzle: DrizzleService,
	mongo: MongoService,
): AuthInstance {
	// Collection names for the Mongo path default to better-auth's own model
	// names (singular — "user", "session", ...), matching the Postgres side's
	// singular table names. No schema-mapping option exists on mongodbAdapter
	// like drizzleAdapter's `schema: {...}` — Mongo just needs a collection
	// name, not a table object, so there's nothing to map.
	const database =
		process.env.DATABASE_DRIVER === 'mongo'
			? mongodbAdapter(mongo.db, { client: mongo.db.client, transaction: true })
			: drizzleAdapter(drizzle.db, {
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
			database: {
				// Without this, the Mongo adapter defaults _id to a real BSON
				// ObjectId (or, with generateId:'uuid', a BSON UUID binary) —
				// neither is a plain string, so every cross-collection string
				// reference this app stores (post.authorId, follow.followerId,
				// media.uploaderId, ...) would never match the user's actual
				// _id. Forcing a plain string id keeps every collection's ids
				// in the same representation, and changes nothing on the
				// Postgres/Drizzle path (users.id is already a plain text
				// column, just populated with a different string generator).
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
