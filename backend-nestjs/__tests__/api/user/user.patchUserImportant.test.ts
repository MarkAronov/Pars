import { describe, it, expect, beforeAll } from 'vitest';
import { getApp } from '../../database';
import request from 'supertest';

describe('PATCH /api/users/me/important', () => {
	let app: Awaited<ReturnType<typeof getApp>>;
	let cookie: string;

	beforeAll(async () => {
		app = await getApp();
		const email = `patch-important-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'P@ssw0rd123!', name: 'Patch Important' });
		const res = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'P@ssw0rd123!' });
		cookie = (res.headers['set-cookie'] as string[])[0];
	});

	it('updates username with correct current password', async () => {
		const res = await request(app.getHttpServer())
			.patch('/api/users/me/important')
			.set('Cookie', cookie)
			.send({ username: `newuser${Date.now()}`, currentPassword: 'P@ssw0rd123!' })
			.expect(200);
		expect(res.body).toHaveProperty('username');
	});

	it('rejects with wrong current password', async () => {
		await request(app.getHttpServer())
			.patch('/api/users/me/important')
			.set('Cookie', cookie)
			.send({ username: 'shouldfail', currentPassword: 'WrongPass123!' })
			.expect(401);
	});
});
