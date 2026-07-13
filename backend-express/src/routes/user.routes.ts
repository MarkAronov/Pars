import {
	PatchUserImportantDto,
	PatchUserPasswordDto,
	PatchUserRegularDto,
	type UserService,
} from '@pars/db-adapters';
import { Router } from 'express';
import { requireRole } from '../middleware/roles.middleware';
import {
	type AuthedRequest,
	requireSession,
} from '../middleware/session.middleware';
import { validateBody } from '../middleware/validate.middleware';

// Mirrors backend-nestjs/src/api/user/user.controller.ts route-for-route,
// including its one non-default status code (POST :id/follow -> 200,
// Express's own default for POST is 201 like Nest's).
export const createUserRoutes = (userService: UserService): Router => {
	const router = Router();

	router.get('/', async (req, res, next) => {
		try {
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 20);
			res.json(await userService.findAll(page, limit));
		} catch (err) {
			next(err);
		}
	});

	router.get('/me', requireSession, async (req: AuthedRequest, res, next) => {
		try {
			res.json(await userService.findById((req.user as { id: string }).id));
		} catch (err) {
			next(err);
		}
	});

	router.get('/:id', async (req, res, next) => {
		try {
			res.json(await userService.findByIdOrUsername(req.params.id));
		} catch (err) {
			next(err);
		}
	});

	router.patch(
		'/me',
		requireSession,
		validateBody(PatchUserRegularDto),
		async (req: AuthedRequest, res, next) => {
			try {
				res.json(
					await userService.patchRegular(
						(req.user as { id: string }).id,
						req.body,
					),
				);
			} catch (err) {
				next(err);
			}
		},
	);

	router.patch(
		'/me/important',
		requireSession,
		validateBody(PatchUserImportantDto),
		async (req: AuthedRequest, res, next) => {
			try {
				res.json(
					await userService.patchImportant(
						(req.user as { id: string }).id,
						req.body,
					),
				);
			} catch (err) {
				next(err);
			}
		},
	);

	router.patch(
		'/me/password',
		requireSession,
		validateBody(PatchUserPasswordDto),
		async (req: AuthedRequest, res, next) => {
			try {
				res.json(
					await userService.patchPassword(
						(req.user as { id: string }).id,
						req.body,
					),
				);
			} catch (err) {
				next(err);
			}
		},
	);

	router.delete(
		'/me',
		requireSession,
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string; role: string };
				res.json(await userService.deleteUser(user.id, user.id, user.role));
			} catch (err) {
				next(err);
			}
		},
	);

	router.delete(
		'/:id',
		requireSession,
		requireRole('admin'),
		async (req: AuthedRequest, res, next) => {
			try {
				const requester = req.user as { id: string; role: string };
				res.json(
					await userService.deleteUser(
						requester.id,
						req.params.id as string,
						requester.role,
					),
				);
			} catch (err) {
				next(err);
			}
		},
	);

	router.get(
		'/:id/following-status',
		requireSession,
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string };
				res.json(
					await userService.isFollowing(user.id, req.params.id as string),
				);
			} catch (err) {
				next(err);
			}
		},
	);

	router.post(
		'/:id/follow',
		requireSession,
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string };
				res
					.status(200)
					.json(await userService.follow(user.id, req.params.id as string));
			} catch (err) {
				next(err);
			}
		},
	);

	router.delete(
		'/:id/follow',
		requireSession,
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string };
				res.json(await userService.unfollow(user.id, req.params.id as string));
			} catch (err) {
				next(err);
			}
		},
	);

	router.get('/:id/followers', async (req, res, next) => {
		try {
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 20);
			res.json(await userService.getFollowers(req.params.id, page, limit));
		} catch (err) {
			next(err);
		}
	});

	router.get('/:id/following', async (req, res, next) => {
		try {
			const page = Number(req.query.page ?? 1);
			const limit = Number(req.query.limit ?? 20);
			res.json(await userService.getFollowing(req.params.id, page, limit));
		} catch (err) {
			next(err);
		}
	});

	return router;
};
