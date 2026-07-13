import { resolve } from 'node:path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { authRoutes } from './auth/auth.routes';
import type { RepositorySet } from './database/container';
import { errorHandler } from './middleware/error.middleware';
import { createFeedRoutes } from './routes/feed.routes';
import { createMediaRoutes } from './routes/media.routes';
import { createPostRoutes } from './routes/post.routes';
import { createSearchRoutes } from './routes/search.routes';
import { createThreadRoutes } from './routes/thread.routes';
import { createTopicRoutes } from './routes/topic.routes';
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

	// Serve uploaded files from disk when using the local storage driver.
	// /media/* is intentionally outside /api, matching backend-nestjs.
	if (process.env.STORAGE_DRIVER === 'local') {
		app.use('/media', express.static(resolve(process.cwd(), 'media')));
	}

	app.use(express.json());

	const api = express.Router();
	api.use('/auth', authRoutes);
	api.use('/users', createUserRoutes(repos.userService));
	api.use('/posts', createPostRoutes(repos.postService));
	api.use('/threads', createThreadRoutes(repos.threadService));
	api.use('/topics', createTopicRoutes(repos.topicService));
	api.use('/media', createMediaRoutes(repos.mediaService));
	api.use('/search', createSearchRoutes(repos.searchService));
	api.use('/feed', createFeedRoutes(repos.feedService));
	app.use('/api', api);

	app.use(errorHandler);

	return app;
};
