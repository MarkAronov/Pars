/**
 * Per-test-file setup — bootstraps the NestJS app once per file,
 * clears DB rows between tests, and shuts the app down after all tests.
 */
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

let app: INestApplication;
let prisma: PrismaService;

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
	await app.init();

	prisma = moduleRef.get(PrismaService);
});

afterEach(async () => {
	// Delete in dependency order to satisfy FK constraints
	await prisma.$transaction([
		prisma.postLike.deleteMany(),
		prisma.media.deleteMany(),
		prisma.post.deleteMany(),
		prisma.thread.deleteMany(),
		prisma.topic.deleteMany(),
		prisma.follow.deleteMany(),
		prisma.twoFactor.deleteMany(),
		prisma.verification.deleteMany(),
		prisma.account.deleteMany(),
		prisma.session.deleteMany(),
		prisma.user.deleteMany(),
	]);
});

afterAll(async () => {
	await app.close();
});

export { app, prisma };

