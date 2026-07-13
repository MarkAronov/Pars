import type { SearchService } from '@pars/db-adapters';
import { Router } from 'express';

// Mirrors backend-nestjs/src/api/search/search.controller.ts.
export const createSearchRoutes = (searchService: SearchService): Router => {
	const router = Router();

	router.get('/', async (req, res, next) => {
		try {
			const q = (req.query.q as string) ?? '';
			const type = (req.query.type as string) ?? 'posts';
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 20);
			res.json(await searchService.searchAll(q, type, page, limit));
		} catch (err) {
			next(err);
		}
	});

	return router;
};
