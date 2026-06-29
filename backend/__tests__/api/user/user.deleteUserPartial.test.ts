import { describe, it, beforeAll } from 'vitest';
import { getApp, getDrizzle } from '../database';
import request from 'supertest';
import * as argon2 from 'argon2';
import { users, accounts } from '../../src/database/schema';

describe('DELETE /api/users/:id (admin)', () => {
	let app: Awaited<ReturnType<typeof getApp>>;

	beforeAll(async () => {
		app = await getApp();
	});

	it('admin can delete another user', async () => {
		const db = getDrizzle().db;

		// Create admin directly with hashed password
		const adminEmail = `admin-partial-${Date.now()}@test.com`;
		const adminPassword = 'Admin@123456!';
		const hash = await argon2.hash(adminPassword);

		const [admin] = await db
			.insert(users)
			.values({ id: crypto.randomUUID(), email: adminEmail, name: 'Admin User', emailVerified: true, role: 'admin' })
			.returning();
		await db.insert(accounts).values({
			id: crypto.randomUUID(),
			accountId: admin.id,
			providerId: 'credential',
			userId: admin.id,
			password: hash,
		});

		// Create target user via API
		const targetEmail = `target-partial-${Date.now()}@test.com`;
		await request(app.getHttpServer())
			.post('/api/auth/sign-up/email')
			.send({ email: targetEmail, password: 'P@ssw0rd123!', name: 'Target' });
		const targetLoginRes = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email: targetEmail, password: 'P@ssw0rd123!' });
		const targetCookie = (targetLoginRes.headers['set-cookie'] as string[])[0];
		const targetMeRes = await request(app.getHttpServer())
			.get('/api/users/me')
			.set('Cookie', targetCookie);
		const targetId = targetMeRes.body.id;

		// Sign in as admin
		const adminLoginRes = await request(app.getHttpServer())
			.post('/api/auth/sign-in/email')
			.send({ email: adminEmail, password: adminPassword });
		const adminCookie = (adminLoginRes.headers['set-cookie'] as string[])[0];

		await request(app.getHttpServer())
			.delete(`/api/users/${targetId}`)
			.set('Cookie', adminCookie)
			.expect(200);
	});
});
