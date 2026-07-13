import { HttpException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

// The shared services in packages/db-adapters throw @nestjs/common's
// exception classes directly — they're plain classes (no Nest runtime
// dependency, just getStatus()/getResponse()), reused here rather than
// inventing a parallel error hierarchy so both backends produce byte-
// identical error JSON for the same status codes. Mirrors Nest's own
// default exception filter shape: { statusCode, message, error }.
// Express only recognizes this as error-handling middleware if it declares
// exactly 4 parameters — trimming the unused ones would silently break it.
export const errorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (err instanceof HttpException) {
		res.status(err.getStatus()).json(err.getResponse());
		return;
	}
	console.error(err);
	res.status(500).json({
		statusCode: 500,
		message: 'Internal server error',
		error: 'Internal Server Error',
	});
};
