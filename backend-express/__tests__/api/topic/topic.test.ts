import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('POST /api/topics — create topic (moderator/admin only)', () => {
	it('rejects a regular user', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprTopicRegular');
		await request(app)
			.post('/api/topics')
			.set('Cookie', user.cookie)
			.send({ name: 'Should fail' })
			.expect(403);
	});

	it('allows a moderator to create a topic', async () => {
		const app = await getApp();
		const mod = await signUpAndLogin('exprTopicMod', 'moderator');
		const res = await request(app)
			.post('/api/topics')
			.set('Cookie', mod.cookie)
			.send({ name: `ModTopic-${Date.now()}` })
			.expect(201);
		expect(res.body.name).toContain('ModTopic');
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		await request(app)
			.post('/api/topics')
			.send({ name: 'No auth' })
			.expect(401);
	});
});

describe('GET /api/topics and GET /api/topics/:id', () => {
	it('lists topics and fetches one by id', async () => {
		const app = await getApp();
		const mod = await signUpAndLogin('exprTopicListMod', 'moderator');
		const created = await request(app)
			.post('/api/topics')
			.set('Cookie', mod.cookie)
			.send({ name: `ListTopic-${Date.now()}` })
			.expect(201);

		const list = await request(app).get('/api/topics').expect(200);
		expect(
			list.body.some((t: { id: string }) => t.id === created.body.id),
		).toBe(true);

		const single = await request(app)
			.get(`/api/topics/${created.body.id}`)
			.expect(200);
		expect(single.body.id).toBe(created.body.id);
	});
});

describe('PATCH /api/topics/:id — edit topic (moderator/admin only)', () => {
	it('allows a moderator to edit a topic', async () => {
		const app = await getApp();
		const mod = await signUpAndLogin('exprTopicPatchMod', 'moderator');
		const created = await request(app)
			.post('/api/topics')
			.set('Cookie', mod.cookie)
			.send({ name: `PatchTopic-${Date.now()}` })
			.expect(201);

		const patched = await request(app)
			.patch(`/api/topics/${created.body.id}`)
			.set('Cookie', mod.cookie)
			.send({ description: 'Updated description' })
			.expect(200);
		expect(patched.body.description).toBe('Updated description');
	});
});

describe('DELETE /api/topics/:id — admin only', () => {
	it('rejects a moderator (admin-only endpoint)', async () => {
		const app = await getApp();
		const mod = await signUpAndLogin('exprTopicDeleteMod', 'moderator');
		const created = await request(app)
			.post('/api/topics')
			.set('Cookie', mod.cookie)
			.send({ name: `DeleteTopic-${Date.now()}` })
			.expect(201);

		await request(app)
			.delete(`/api/topics/${created.body.id}`)
			.set('Cookie', mod.cookie)
			.expect(403);
	});

	it('allows an admin to delete a topic', async () => {
		const app = await getApp();
		const admin = await signUpAndLogin('exprTopicDeleteAdmin', 'admin');
		const created = await request(app)
			.post('/api/topics')
			.set('Cookie', admin.cookie)
			.send({ name: `DeleteTopic2-${Date.now()}` })
			.expect(201);

		await request(app)
			.delete(`/api/topics/${created.body.id}`)
			.set('Cookie', admin.cookie)
			.expect(200);
	});
});
