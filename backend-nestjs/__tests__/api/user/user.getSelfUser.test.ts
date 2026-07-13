import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { getApp } from '../../database';

describe('GET /api/users/me', () => {
	let app: Awaited<ReturnType<typeof getApp>>;
	let cookie: string;

	beforeAll(async () => {
		app = await getApp();
		const email = `self-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'P@ssw0rd123!', name: 'Self User' });
		const res = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'P@ssw0rd123!' });
		cookie = (res.headers['set-cookie'] as string[])[0];
	});

	it('returns own profile when authenticated', async () => {
		const res = await request(app.getHttpServer())
			.get('/api/users/me')
			.set('Cookie', cookie)
			.expect(200);
		expect(res.body).toHaveProperty('id');
	});

	it('returns 401 without session', async () => {
		await request(app.getHttpServer()).get('/api/users/me').expect(401);
	});
});
