import type { Request, Response } from 'express';
import { Router } from 'express';
import { getAuth } from './auth.config';

// Ported verbatim from backend-nestjs/src/api/auth/auth.controller.ts — this
// Fetch-Request bridge (and the Set-Cookie append-not-set fix below) was
// hard-won there; do not re-derive it.
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

export const authRoutes = Router();

authRoutes.all('*splat', async (req: Request, res: Response) => {
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
});
