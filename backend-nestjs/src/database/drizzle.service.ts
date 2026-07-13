import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common';
import * as schema from '@pars/db-adapters/schema';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
	private client?: ReturnType<typeof postgres>;
	db!: ReturnType<typeof drizzle<typeof schema>>;

	async onModuleInit() {
		// Mirrors MongoService's own driver check — DrizzleModule is imported
		// unconditionally (DatabaseModule/AuthModule need it available for the
		// default Postgres branch), but connecting shouldn't be when Mongo is
		// the selected driver.
		if (process.env.DATABASE_DRIVER === 'mongo') return;
		const dbUrl = process.env.DATABASE_URL;
		if (!dbUrl) throw new Error('DATABASE_URL environment variable is not set');
		this.client = postgres(dbUrl);
		this.db = drizzle(this.client, { schema });
		await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
	}

	async onModuleDestroy() {
		await this.client?.end();
	}
}
