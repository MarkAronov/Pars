import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { authRoutes } from './auth/auth.routes';
import type { RepositorySet } from './database/container';
import { errorHandler } from './middleware/error.middleware';
import { createPostRoutes } from './routes/post.routes';
import { createUserRoutes } from './routes/user.routes';

// Mirrors backend-nestjs/src/main.ts's middleware stack and global '/api'
// prefix (NestFactory.create() with platform-express applies body parsing
// globally before any handler runs, including the auth controller's
// catch-all — express.json() must be registered before authRoutes here for
// the same reason: toFetchRequest() assumes req.body is already parsed).
export const createApp = (repos: RepositorySet): Express => {
	const app = express();

	app.use(helmet());
	app.use(cookieParser());
	app.use(compression());
	app.use(
		cors({
			origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
			credentials: true,
		}),
	);
	app.use(express.json());

	const api = express.Router();
	api.use('/auth', authRoutes);
	api.use('/users', createUserRoutes(repos.userService));
	api.use('/posts', createPostRoutes(repos.postService));
	app.use('/api', api);

	app.use(errorHandler);

	return app;
};
