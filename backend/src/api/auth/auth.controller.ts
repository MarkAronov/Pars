import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { getAuth } from './auth.config';

// better-auth's handler expects a Fetch API Request; Express's req only
// resembles one (plain header object, no .get()), so it must be rebuilt.
const toFetchRequest = (req: Request): globalThis.Request => {
	const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (Array.isArray(value)) {
			for (const v of value) headers.append(key, v);
		} else if (value) {
			headers.append(key, value);
		}
	}
	const hasBody = !['GET', 'HEAD'].includes(req.method);
	return new Request(url, {
		method: req.method,
		headers,
		body: hasBody ? JSON.stringify(req.body) : undefined,
	});
};

@Controller('auth')
export class AuthController {
	@All('*')
	async handler(@Req() req: Request, @Res() res: Response) {
		const auth = getAuth();
		const response = await auth.handler(toFetchRequest(req));
		res.status(response.status);
		// Set-Cookie isn't joined by the Fetch spec, so forEach yields one entry
		// per cookie (e.g. session token + cache) — setHeader would drop all but
		// the last, so cookies specifically must be appended instead.
		response.headers.forEach((value, key) => {
			if (key.toLowerCase() === 'set-cookie') {
				res.appendHeader(key, value);
			} else {
				res.setHeader(key, value);
			}
		});
		const body = await response.text();
		res.send(body);
	}
}
