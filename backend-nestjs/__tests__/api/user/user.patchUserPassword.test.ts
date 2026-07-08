import { describe, it, expect, beforeAll } from 'vitest';
import { getApp } from '../database';
import request from 'supertest';

describe('PATCH /api/users/me/password', () => {
	let app: Awaited<ReturnType<typeof getApp>>;
	let cookie: string;

	beforeAll(async () => {
		app = await getApp();
		const email = `patch-password-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'OldPass123!', name: 'Patch Password' });
		const res = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'OldPass123!' });
		cookie = (res.headers['set-cookie'] as string[])[0];
	});

	it('changes password with correct current password', async () => {
		await request(app.getHttpServer())
			.patch('/api/users/me/password')
			.set('Cookie', cookie)
			.send({ currentPassword: 'OldPass123!', newPassword: 'NewPass456!' })
			.expect(200);
	});

	it('rejects with wrong current password', async () => {
		await request(app.getHttpServer())
			.patch('/api/users/me/password')
			.set('Cookie', cookie)
			.send({ currentPassword: 'WrongPass!', newPassword: 'NewPass789!' })
			.expect(401);
	});
});
