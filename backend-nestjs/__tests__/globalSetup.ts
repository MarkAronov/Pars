import { execSync } from 'node:child_process';
import path from 'node:path';
import {
	MongoDBContainer,
	type StartedMongoDBContainer,
} from '@testcontainers/mongodb';
import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import {
	RedisContainer,
	type StartedRedisContainer,
} from '@testcontainers/redis';
import postgres from 'postgres';

let pgContainer: StartedPostgreSqlContainer | undefined;
let mongoContainer: StartedMongoDBContainer | undefined;
let redisContainer: StartedRedisContainer;

const driver =
	process.env.TEST_DATABASE_DRIVER === 'mongo' ? 'mongo' : 'postgres';

export async function setup() {
	redisContainer = await new RedisContainer('redis:7-alpine').start();

	process.env.DATABASE_DRIVER = driver;
	process.env.REDIS_URL = redisContainer.getConnectionUrl();
	process.env.NODE_ENV = 'test';
	process.env.SESSION_SECRET = 'test-secret-at-least-32-chars-long!!';
	process.env.CORS_ORIGIN = 'http://localhost:5173';
	process.env.PORT = '0';
	process.env.STORAGE_DRIVER = 'local';

	if (driver === 'mongo') {
		// MongoDBContainer provisions a single-node replica set itself — the
		// Mongo repositories' cascade-delete logic needs session.withTransaction(),
		// which only works on a replica set, even a single-node one.
		mongoContainer = await new MongoDBContainer('mongo:7').start();
		// rs.initiate() registers the member under its own container-id
		// hostname, which isn't resolvable outside Docker's network — the
		// driver's normal replica-set topology discovery would try to reach
		// that hostname and fail with ENOTFOUND. directConnection=true skips
		// discovery and talks directly to the one seed host instead, which is
		// sufficient for a single-node set (including transactions).
		process.env.MONGO_URL = `${mongoContainer.getConnectionString()}/pars_test?directConnection=true`;
		return;
	}

	pgContainer = await new PostgreSqlContainer('pgvector/pgvector:pg17')
		.withDatabase('pars_test')
		.withUsername('pars')
		.withPassword('pars')
		.start();
	const databaseUrl = pgContainer.getConnectionUri();
	process.env.DATABASE_URL = databaseUrl;

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
	await mongoContainer?.stop();
	await redisContainer?.stop();
}
