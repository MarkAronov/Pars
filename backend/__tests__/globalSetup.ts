import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { execSync } from 'node:child_process';

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

	// Run migrations against the test database
	execSync('bun run db:migrate', {
		env: { ...process.env, DATABASE_URL: databaseUrl },
		stdio: 'pipe',
	});
}

export async function teardown() {
	await pgContainer?.stop();
	await redisContainer?.stop();
}
