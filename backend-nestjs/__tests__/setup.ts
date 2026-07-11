/**
 * Per-test-file setup — bootstraps the NestJS app once per file,
 * clears DB rows between tests, and shuts the app down after all tests.
 */
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
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { AppModule } from '../src/app.module';
import { DrizzleService } from '../src/database/drizzle.service';

let app: INestApplication;
let drizzle: DrizzleService;

beforeAll(async () => {
	const moduleRef: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleRef.createNestApplication();
	app.use(helmet());
	app.use(cookieParser());
	app.useGlobalPipes(
		new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
	);
	app.setGlobalPrefix('api');
	await app.init();

	drizzle = moduleRef.get(DrizzleService);
});

afterEach(async () => {
	const db = drizzle.db;
	// Delete in dependency order to satisfy FK constraints
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
	await app.close();
});

export { app, drizzle };


