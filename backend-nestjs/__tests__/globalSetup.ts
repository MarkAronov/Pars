import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { execSync } from 'node:child_process';
import path from 'node:path';
import postgres from 'postgres';

let pgContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;

export async function setup() {
	pgContainer = await new PostgreSqlContainer('pgvector/pgvector:pg17')
		.withDatabase('pars_test')
		.withUsername('pars')
		.withPassword('pars')
		.start();

	redisContainer = await new RedisContainer('redis:7-alpine').start();

	const databaseUrl = pgContainer.getConnectionUri();
	process.env.DATABASE_URL = databaseUrl;
	process.env.REDIS_URL = redisContainer.getConnectionUrl();
	process.env.NODE_ENV = 'test';
	process.env.SESSION_SECRET = 'test-secret-at-least-32-chars-long!!';
	process.env.CORS_ORIGIN = 'http://localhost:5173';
	process.env.PORT = '0';
	process.env.STORAGE_DRIVER = 'local';

	// Enable pgvector extension before schema push
	const sql = postgres(databaseUrl);
	await sql`CREATE EXTENSION IF NOT EXISTS vector`;
	await sql.end();

	// Push schema to the test database (no migration history required).
	// drizzle.config.ts lives in packages/db-adapters, which owns the schema.
	execSync('bunx drizzle-kit push --force', {
		cwd: path.resolve(process.cwd(), '../packages/db-adapters'),
		env: { ...process.env, DATABASE_URL: databaseUrl },
		stdio: 'pipe',
	});
}

export async function teardown() {
	await pgContainer?.stop();
	await redisContainer?.stop();
}

