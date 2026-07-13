import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('GET /api/users/me', () => {
	it('returns own profile when authenticated', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('crudSelf');
		const res = await request(app)
			.get('/api/users/me')
			.set('Cookie', user.cookie)
			.expect(200);
		expect(res.body.id).toBe(user.userId);
	});

	it('returns 401 without session', async () => {
		const app = await getApp();
		await request(app).get('/api/users/me').expect(401);
	});
});

describe('GET /api/users/:id', () => {
	it('returns a user by id (public)', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('crudGet');
		const res = await request(app).get(`/api/users/${user.userId}`).expect(200);
		expect(res.body.id).toBe(user.userId);
	});

	it('returns 404 for unknown id', async () => {
		const app = await getApp();
		await request(app)
			.get('/api/users/00000000-0000-0000-0000-000000000000')
			.expect(404);
	});
});

describe('PATCH /api/users/me', () => {
	it('updates displayName', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('crudPatch');
		const res = await request(app)
			.patch('/api/users/me')
			.set('Cookie', user.cookie)
			.send({ displayName: 'New Name' })
			.expect(200);
		expect(res.body.displayName).toBe('New Name');
	});
});

describe('DELETE /api/users/me', () => {
	it('deletes own account when authenticated', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('crudDelete');
		await request(app)
			.delete('/api/users/me')
			.set('Cookie', user.cookie)
			.expect(200);
	});

	it('returns 401 without session', async () => {
		const app = await getApp();
		await request(app).delete('/api/users/me').expect(401);
	});
});
