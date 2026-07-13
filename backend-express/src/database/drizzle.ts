import * as schema from '@pars/db-adapters/schema';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let client: ReturnType<typeof postgres> | undefined;
let db: DrizzleDb | undefined;

export const connectDrizzle = async (): Promise<DrizzleDb> => {
	const dbUrl = process.env.DATABASE_URL;
	if (!dbUrl) throw new Error('DATABASE_URL environment variable is not set');
	client = postgres(dbUrl);
	db = drizzle(client, { schema });
	await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
	return db;
};

export const disconnectDrizzle = async (): Promise<void> => {
	await client?.end();
};
