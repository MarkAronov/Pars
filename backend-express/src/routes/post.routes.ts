import {
	CreatePostDto,
	PatchPostDto,
	type PostService,
} from '@pars/db-adapters';
import { Router } from 'express';
import {
	type AuthedRequest,
	requireSession,
} from '../middleware/session.middleware';
import { validateBody } from '../middleware/validate.middleware';

// Mirrors backend-nestjs/src/api/post/post.controller.ts route-for-route,
// including its POST defaults (create -> 201, like/unlike toggle -> 201 too
// — Nest never overrode the like route's status, so Express doesn't either).
export const createPostRoutes = (postService: PostService): Router => {
	const router = Router();

	router.get('/', async (req, res, next) => {
		try {
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 20);
			const authorId = req.query.authorId as string | undefined;
			res.json(await postService.findAll(page, limit, authorId));
		} catch (err) {
			next(err);
		}
	});

	router.get('/:id', async (req, res, next) => {
		try {
			res.json(await postService.findById(req.params.id));
		} catch (err) {
			next(err);
		}
	});

	router.post(
		'/',
		requireSession,
		validateBody(CreatePostDto),
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string };
				res.status(201).json(await postService.create(user.id, req.body));
			} catch (err) {
				next(err);
			}
		},
	);

	router.patch(
		'/:id',
		requireSession,
		validateBody(PatchPostDto),
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string; role: string };
				res.json(
					await postService.patch(
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
					await postService.delete(req.params.id as string, user.id, user.role),
				);
			} catch (err) {
				next(err);
			}
		},
	);

	router.post(
		'/:id/like',
		requireSession,
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string };
				res
					.status(201)
					.json(await postService.toggleLike(req.params.id as string, user.id));
			} catch (err) {
				next(err);
			}
		},
	);

	return router;
};
