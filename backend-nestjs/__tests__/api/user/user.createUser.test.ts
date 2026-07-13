import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../setup';

describe('POST /api/auth/sign-up/email — user registration', () => {
	it('registers a new user with valid credentials', async () => {
		const res = await supertest(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({
				name: 'Test User',
				email: 'newuser@test.com',
				password: 'Password123@',
			});
		expect(res.status).toBe(200);
		expect(res.body.user.email).toBe('newuser@test.com');
	});

	it('rejects duplicate email', async () => {
		const payload = {
			name: 'Dup',
			email: 'dup@test.com',
			password: 'Password123@',
		};
		await supertest(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send(payload);
		const res = await supertest(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send(payload);
		expect(res.status).toBeGreaterThanOrEqual(400);
	});

	it('rejects a weak password', async () => {
		const res = await supertest(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ name: 'Bad', email: 'bad@test.com', password: '123' });
		expect(res.status).toBeGreaterThanOrEqual(400);
	});
});
