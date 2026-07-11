import { describe, it, expect, beforeAll } from 'vitest';
import { getApp } from '../../database';
import request from 'supertest';

describe('GET /api/users', () => {
	let app: Awaited<ReturnType<typeof getApp>>;

	beforeAll(async () => {
		app = await getApp();
		// Seed a couple of users
		await Promise.all([
			request(app.getHttpServer())
				.post('/api/auth/sign-up/email')
				.send({ email: `list1-${Date.now()}@test.com`, password: 'P@ssw0rd123!', name: 'List One' }),
			request(app.getHttpServer())
				.post('/api/auth/sign-up/email')
				.send({ email: `list2-${Date.now()}@test.com`, password: 'P@ssw0rd123!', name: 'List Two' }),
		]);
	});

	it('returns paginated user list', async () => {
		const res = await request(app.getHttpServer())
			.get('/api/users?page=1&limit=10')
			.expect(200);
		expect(Array.isArray(res.body)).toBe(true);
	});
});
