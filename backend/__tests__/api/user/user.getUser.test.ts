import { describe, it, expect, beforeAll } from 'vitest';
import { getApp } from '../database';
import request from 'supertest';

describe('GET /api/users/:id', () => {
	let app: Awaited<ReturnType<typeof getApp>>;
	let userId: string;

	beforeAll(async () => {
		app = await getApp();
		const email = `getuser-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'P@ssw0rd123!', name: 'Get User' });
		const loginRes = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'P@ssw0rd123!' });
		const cookie = (loginRes.headers['set-cookie'] as string[])[0];
		const meRes = await request(app.getHttpServer())
			.get('/api/users/me')
			.set('Cookie', cookie);
		userId = meRes.body.id;
	});

	it('returns a user by id (public)', async () => {
		const res = await request(app.getHttpServer())
			.get(`/api/users/${userId}`)
			.expect(200);
		expect(res.body.id).toBe(userId);
	});

	it('returns 404 for unknown id', async () => {
		await request(app.getHttpServer())
			.get('/api/users/nonexistent-id-123')
			.expect(404);
	});
});
