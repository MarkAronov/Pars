import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { NextFunction, Request, Response } from 'express';

// Express has no built-in equivalent to Nest's ValidationPipe — this
// replicates the exact options used there (whitelist + forbidNonWhitelisted
// + transform) so both backends reject the same malformed bodies the same
// way, producing the same { statusCode, message, error } shape via
// errorHandler when validation fails.
export const validateBody =
	<T extends object>(DtoClass: new () => T) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		const instance = plainToInstance(DtoClass, req.body);
		const errors = await validate(instance, {
			whitelist: true,
			forbidNonWhitelisted: true,
		});
		if (errors.length > 0) {
			const messages = errors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);
			next(new BadRequestException(messages));
			return;
		}
		req.body = instance;
		next();
	};
