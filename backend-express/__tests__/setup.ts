/**
 * Per-test-file setup — bootstraps the Express app once per file, clears
 * DB rows/documents between tests. Mirrors backend-nestjs/__tests__/setup.ts.
 */
import { COLLECTIONS } from '@pars/db-adapters';
import {
	accounts,
	follows,
	media,
	postLikes,
	postMentions,
	posts,
	sessions,
	threads,
	topics,
	twoFactors,
	users,
	verifications,
} from '@pars/db-adapters/schema';
import type { Db } from 'mongodb';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { createApp } from '../src/app';
import { initAuth } from '../src/auth/auth.config';
import { buildContainer } from '../src/database/container';
import {
	connectDrizzle,
	type DrizzleDb,
	disconnectDrizzle,
} from '../src/database/drizzle';
import { connectMongo, disconnectMongo } from '../src/database/mongo';
import { createStorageProvider } from '../src/storage/storage.service';

let app: ReturnType<typeof createApp>;
let drizzleDb: DrizzleDb | null = null;
let mongoDb: Db | null = null;

beforeAll(async () => {
	const isMongo = process.env.DATABASE_DRIVER === 'mongo';
	drizzleDb = isMongo ? null : await connectDrizzle();
	mongoDb = isMongo ? await connectMongo() : null;

	initAuth(drizzleDb, mongoDb);
	const storage = createStorageProvider();
	const repos = buildContainer(drizzleDb, mongoDb, storage);
	app = createApp(repos);
});

afterEach(async () => {
	if (mongoDb) {
		const db = mongoDb;
		await Promise.all(
			Object.values(COLLECTIONS).map((name) =>
				db.collection(name).deleteMany({}),
			),
		);
		return;
	}
	const db = drizzleDb as DrizzleDb;
	await db.delete(postMentions);
	await db.delete(postLikes);
	await db.delete(media);
	await db.delete(posts);
	await db.delete(threads);
	await db.delete(topics);
	await db.delete(follows);
	await db.delete(twoFactors);
	await db.delete(verifications);
	await db.delete(accounts);
	await db.delete(sessions);
	await db.delete(users);
});

afterAll(async () => {
	await disconnectDrizzle();
	await disconnectMongo();
});

export { app, drizzleDb, mongoDb };
