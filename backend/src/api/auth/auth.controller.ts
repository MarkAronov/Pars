import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { getAuth } from './auth.config';

@Controller('auth')
export class AuthController {
	@All('*')
	async handler(@Req() req: Request, @Res() res: Response) {
		const auth = getAuth();
		const response = await auth.handler(req as unknown as globalThis.Request);
		res.status(response.status);
		response.headers.forEach((value, key) => res.setHeader(key, value));
		const body = await response.text();
		res.send(body);
	}
}
