import { describe, it, expect, beforeAll } from 'vitest';
import { getApp } from '../database';
import request from 'supertest';

describe('PATCH /api/users/me (regular)', () => {
	let app: Awaited<ReturnType<typeof getApp>>;
	let cookie: string;

	beforeAll(async () => {
		app = await getApp();
		const email = `patch-regular-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'P@ssw0rd123!', name: 'Patch Regular' });
		const res = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'P@ssw0rd123!' });
		cookie = (res.headers['set-cookie'] as string[])[0];
	});

	it('updates displayName', async () => {
		const res = await request(app.getHttpServer())
			.patch('/api/users/me')
			.set('Cookie', cookie)
			.send({ displayName: 'Updated Name' })
			.expect(200);
		expect(res.body.displayName).toBe('Updated Name');
	});
});
