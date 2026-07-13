import {
	CreateThreadDto,
	PatchThreadDto,
	type ThreadService,
} from '@pars/db-adapters';
import { Router } from 'express';
import {
	type AuthedRequest,
	requireSession,
} from '../middleware/session.middleware';
import { validateBody } from '../middleware/validate.middleware';

// Mirrors backend-nestjs/src/api/thread/thread.controller.ts route-for-route.
export const createThreadRoutes = (threadService: ThreadService): Router => {
	const router = Router();

	router.get('/', async (req, res, next) => {
		try {
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 20);
			const topicId = req.query.topicId as string | undefined;
			res.json(await threadService.findAll(page, limit, topicId));
		} catch (err) {
			next(err);
		}
	});

	router.get('/:id', async (req, res, next) => {
		try {
			res.json(await threadService.findById(req.params.id as string));
		} catch (err) {
			next(err);
		}
	});

	router.post(
		'/',
		requireSession,
		validateBody(CreateThreadDto),
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string };
				res.status(201).json(await threadService.create(user.id, req.body));
			} catch (err) {
				next(err);
			}
		},
	);

	router.patch(
		'/:id',
		requireSession,
		validateBody(PatchThreadDto),
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string; role: string };
				res.json(
					await threadService.patch(
						req.params.id as string,
						user.id,
						user.role,
						req.body,
					),
				);
			} catch (err) {
				next(err);
			}
		},
	);

	router.delete(
		'/:id',
		requireSession,
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string; role: string };
				res.json(
					await threadService.delete(
						req.params.id as string,
						user.id,
						user.role,
					),
				);
			} catch (err) {
				next(err);
			}
		},
	);

	return router;
};
