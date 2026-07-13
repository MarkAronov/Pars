import {
	CreateTopicDto,
	PatchTopicDto,
	type TopicService,
} from '@pars/db-adapters';
import { Router } from 'express';
import { requireRole } from '../middleware/roles.middleware';
import { requireSession } from '../middleware/session.middleware';
import { validateBody } from '../middleware/validate.middleware';

// Mirrors backend-nestjs/src/api/topic/topic.controller.ts route-for-route.
export const createTopicRoutes = (topicService: TopicService): Router => {
	const router = Router();

	router.get('/', async (req, res, next) => {
		try {
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 50);
			res.json(await topicService.findAll(page, limit));
		} catch (err) {
			next(err);
		}
	});

	router.get('/:id', async (req, res, next) => {
		try {
			res.json(await topicService.findById(req.params.id as string));
		} catch (err) {
			next(err);
		}
	});

	router.post(
		'/',
		requireSession,
		requireRole('moderator', 'admin'),
		validateBody(CreateTopicDto),
		async (req, res, next) => {
			try {
				res.status(201).json(await topicService.create(req.body));
			} catch (err) {
				next(err);
			}
		},
	);

	router.patch(
		'/:id',
		requireSession,
		requireRole('moderator', 'admin'),
		validateBody(PatchTopicDto),
		async (req, res, next) => {
			try {
				res.json(await topicService.patch(req.params.id as string, req.body));
			} catch (err) {
				next(err);
			}
		},
	);

	router.delete(
		'/:id',
		requireSession,
		requireRole('admin'),
		async (req, res, next) => {
			try {
				res.json(await topicService.delete(req.params.id as string));
			} catch (err) {
				next(err);
			}
		},
	);

	return router;
};
