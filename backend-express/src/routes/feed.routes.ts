import type { FeedService } from '@pars/db-adapters';
import { Router } from 'express';
import {
	type AuthedRequest,
	requireSession,
} from '../middleware/session.middleware';

// Mirrors backend-nestjs/src/api/feed/feed.controller.ts.
export const createFeedRoutes = (feedService: FeedService): Router => {
	const router = Router();

	router.get('/', requireSession, async (req: AuthedRequest, res, next) => {
		try {
			const user = req.user as { id: string };
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 20);
			res.json(await feedService.getForUser(user.id, page, limit));
		} catch (err) {
			next(err);
		}
	});

	return router;
};
