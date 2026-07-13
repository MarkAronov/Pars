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
import postgres from 'postgres';

// Mirrors backend-nestjs/__tests__/globalSetup.ts — same dual-driver
// testcontainers setup, no Redis here since backend-express doesn't wire
// Socket.IO until Phase E.
let pgContainer: StartedPostgreSqlContainer | undefined;
let mongoContainer: StartedMongoDBContainer | undefined;

const driver =
	process.env.TEST_DATABASE_DRIVER === 'mongo' ? 'mongo' : 'postgres';

export async function setup() {
	process.env.DATABASE_DRIVER = driver;
	process.env.NODE_ENV = 'test';
	process.env.SESSION_SECRET = 'test-secret-at-least-32-chars-long!!';
	process.env.CORS_ORIGIN = 'http://localhost:5173';
	process.env.PORT = '0';
	process.env.STORAGE_DRIVER = 'local';

	if (driver === 'mongo') {
		mongoContainer = await new MongoDBContainer('mongo:7').start();
		// See backend-nestjs/__tests__/globalSetup.ts for why directConnection
		// is required — the replica-set member advertises its own container-id
		// hostname, which isn't resolvable outside Docker's network.
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

	const sql = postgres(databaseUrl);
	await sql`CREATE EXTENSION IF NOT EXISTS vector`;
	await sql.end();

	execSync('bunx drizzle-kit push --force', {
		cwd: path.resolve(process.cwd(), '../packages/db-adapters'),
		env: { ...process.env, DATABASE_URL: databaseUrl },
		stdio: 'pipe',
	});
}

export async function teardown() {
	await pgContainer?.stop();
	await mongoContainer?.stop();
}
