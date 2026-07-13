import type { MediaService } from '@pars/db-adapters';
import { Router } from 'express';
import multer from 'multer';
import {
	type AuthedRequest,
	requireSession,
} from '../middleware/session.middleware';

const upload = multer({ storage: multer.memoryStorage() });

// Mirrors backend-nestjs/src/api/media/media.controller.ts route-for-route.
export const createMediaRoutes = (mediaService: MediaService): Router => {
	const router = Router();

	router.post(
		'/avatar',
		requireSession,
		upload.single('file'),
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string };
				const file = req.file as Express.Multer.File;
				res.status(201).json(await mediaService.uploadAvatar(user.id, file));
			} catch (err) {
				next(err);
			}
		},
	);

	router.post(
		'/background',
		requireSession,
		upload.single('file'),
		async (req: AuthedRequest, res, next) => {
			try {
				const user = req.user as { id: string };
				const file = req.file as Express.Multer.File;
				res
					.status(201)
					.json(await mediaService.uploadBackground(user.id, file));
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
				res.json(await mediaService.deleteMedia(req.params.id as string));
			} catch (err) {
				next(err);
			}
		},
	);

	return router;
};
