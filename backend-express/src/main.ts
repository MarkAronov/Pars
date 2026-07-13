import { createServer } from 'node:http';
import { createApp } from './app';
import { initAuth } from './auth/auth.config';
import { buildContainer } from './database/container';
import { connectDrizzle } from './database/drizzle';
import { connectMongo } from './database/mongo';
import { createRedisClient } from './database/redis';
import { attachSockets } from './gateways/sockets';
import { createStorageProvider } from './storage/storage.service';

const bootstrap = async () => {
	const isMongo = process.env.DATABASE_DRIVER === 'mongo';
	const drizzleDb = isMongo ? null : await connectDrizzle();
	const mongoDb = isMongo ? await connectMongo() : null;

	initAuth(drizzleDb, mongoDb);
	const storage = createStorageProvider();
	const repos = buildContainer(drizzleDb, mongoDb, storage);
	const app = createApp(repos);

	const httpServer = createServer(app);
	const redis = createRedisClient();
	attachSockets(httpServer, redis);

	httpServer.listen(process.env.PORT ?? 3001);
};

bootstrap();
