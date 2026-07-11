import { describe, it, expect, beforeAll } from 'vitest';
import { getApp } from '../../database';
import request from 'supertest';

describe('POST /api/auth/sign-up + sign-in', () => {
	let app: Awaited<ReturnType<typeof getApp>>;

	beforeAll(async () => {
		app = await getApp();
	});

	it('signs up and signs in, returning a session cookie', async () => {
		const email = `login-${Date.now()}@test.com`;
		const password = 'P@ssw0rd123!';

		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password, name: 'Login User' })
			.expect(200);

		const res = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password })
			.expect(200);

		expect(res.headers['set-cookie']).toBeDefined();
	});

	it('rejects wrong password with 401', async () => {
		const email = `login-wrong-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'CorrectPass123!', name: 'User' })
			.expect(200);

		await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'WrongPass123!' })
			.expect(401);
	});

	it('rejects unknown email with 401', async () => {
		await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email: 'nobody@nowhere.com', password: 'Pass123!' })
			.expect(401);
	});
});
