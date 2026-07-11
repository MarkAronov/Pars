import { describe, it, expect, beforeAll } from 'vitest';
import { getApp } from '../../database';
import request from 'supertest';

describe('DELETE /api/users/me', () => {
	let app: Awaited<ReturnType<typeof getApp>>;

	beforeAll(async () => {
		app = await getApp();
	});

	it('deletes own account when authenticated', async () => {
		const email = `delete-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'P@ssw0rd123!', name: 'Delete Me' });
		const loginRes = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'P@ssw0rd123!' });
		const cookie = (loginRes.headers['set-cookie'] as string[])[0];

		await request(app.getHttpServer())
			.delete('/api/users/me')
			.set('Cookie', cookie)
			.expect(200);
	});

	it('returns 401 without session', async () => {
		await request(app.getHttpServer()).delete('/api/users/me').expect(401);
	});
});
