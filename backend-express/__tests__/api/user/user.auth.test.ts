import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';

describe('POST /api/auth/sign-up + sign-in', () => {
	it('signs up and signs in, returning a session cookie', async () => {
		const app = await getApp();
		const email = `authtest-${Date.now()}@test.com`;
		const password = 'P@ssw0rd123!';

		await request(app)
			.post('/api/auth/sign-up/email')
			.send({ email, password, name: 'Auth Test' })
			.expect(200);

		const loginRes = await request(app)
			.post('/api/auth/sign-in/email')
			.send({ email, password })
			.expect(200);

		expect(loginRes.headers['set-cookie']).toBeDefined();
	});

	it('rejects wrong password with 401', async () => {
		const app = await getApp();
		const email = `authtest2-${Date.now()}@test.com`;
		await request(app)
			.post('/api/auth/sign-up/email')
			.send({ email, password: 'P@ssw0rd123!', name: 'Auth Test 2' });

		await request(app)
			.post('/api/auth/sign-in/email')
			.send({ email, password: 'WrongPassword1!' })
			.expect(401);
	});
});
