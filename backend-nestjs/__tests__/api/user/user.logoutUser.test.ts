import { describe, it, beforeAll } from 'vitest';
import { getApp } from '../database';
import request from 'supertest';

describe('POST /api/auth/sign-out', () => {
	let app: Awaited<ReturnType<typeof getApp>>;
	let cookie: string;

	beforeAll(async () => {
		app = await getApp();
		const email = `logout-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'P@ssw0rd123!', name: 'Logout User' });
		const res = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'P@ssw0rd123!' });
		cookie = (res.headers['set-cookie'] as string[])[0];
	});

	it('signs out successfully', async () => {
		await request(app.getHttpServer())
			.post('/api/auth/sign-out')
			.set('Cookie', cookie)
			.expect(200);
	});
});
