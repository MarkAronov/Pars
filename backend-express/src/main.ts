import { createApp } from './app';
import { initAuth } from './auth/auth.config';
import { buildContainer } from './database/container';
import { connectDrizzle } from './database/drizzle';
import { connectMongo } from './database/mongo';

const bootstrap = async () => {
	const isMongo = process.env.DATABASE_DRIVER === 'mongo';
	const drizzleDb = isMongo ? null : await connectDrizzle();
	const mongoDb = isMongo ? await connectMongo() : null;

	initAuth(drizzleDb, mongoDb);
	const repos = buildContainer(drizzleDb, mongoDb);
	const app = createApp(repos);

	app.listen(process.env.PORT ?? 3001);
};

bootstrap();
