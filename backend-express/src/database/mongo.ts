import { ensureIndexes } from '@pars/db-adapters';
import { type Db, MongoClient } from 'mongodb';

let client: MongoClient | undefined;
let db: Db | undefined;

export const connectMongo = async (): Promise<Db> => {
	const url = process.env.MONGO_URL;
	if (!url) throw new Error('MONGO_URL environment variable is not set');
	client = new MongoClient(url, { ignoreUndefined: true });
	await client.connect();
	db = client.db();
	await ensureIndexes(db);
	return db;
};

export const disconnectMongo = async (): Promise<void> => {
	await client?.close();
};
