import {
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common';
import { ensureIndexes } from '@pars/db-adapters';
import { type Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
	private client?: MongoClient;
	db!: Db;

	async onModuleInit() {
		// Importing MongoModule is unconditional (DatabaseModule needs it
		// available for the DATABASE_DRIVER=mongo branch), but connecting
		// shouldn't be — most setups run Postgres-only and never provision
		// Mongo, so this only connects when actually selected as the driver.
		if (process.env.DATABASE_DRIVER !== 'mongo') return;
		const url = process.env.MONGO_URL;
		if (!url) throw new Error('MONGO_URL environment variable is not set');
		this.client = new MongoClient(url, {
			// Without this, the driver's BSON serializer converts `undefined`
			// values to BSON null on write — a partial patch DTO built by
			// class-transformer carries every declared field as an own key
			// (`{ title: 'x', topicId: undefined }`), so `$set` would silently
			// null out every field the caller didn't actually send. Postgres's
			// Drizzle `.set()` has no equivalent footgun — it drops undefined
			// keys before generating SQL.
			ignoreUndefined: true,
		});
		await this.client.connect();
		this.db = this.client.db();
		await ensureIndexes(this.db);
	}

	async onModuleDestroy() {
		await this.client?.close();
	}
}
