import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('PATCH /api/topics/:id — edit topic (moderator/admin only)', () => {
	it('allows a moderator to edit a topic', async () => {
		const app = await getApp();
		const mod = await signUpAndLogin('topicPatchMod', 'moderator');

		const created = await request(app.getHttpServer())
			.post('/api/topics')
			.set('Cookie', mod.cookie)
			.send({ name: 'Sports' })
			.expect(201);

		const patched = await request(app.getHttpServer())
			.patch(`/api/topics/${created.body.id}`)
			.set('Cookie', mod.cookie)
			.send({ description: 'All things sports' })
			.expect(200);
		expect(patched.body.description).toBe('All things sports');
	});

	it('rejects a regular user', async () => {
		const app = await getApp();
		const mod = await signUpAndLogin('topicPatchMod2', 'moderator');
		const created = await request(app.getHttpServer())
			.post('/api/topics')
			.set('Cookie', mod.cookie)
			.send({ name: 'Music' })
			.expect(201);

		const user = await signUpAndLogin('topicPatchRegular');
		await request(app.getHttpServer())
			.patch(`/api/topics/${created.body.id}`)
			.set('Cookie', user.cookie)
			.send({ description: 'nope' })
			.expect(403);
	});

	it('returns 404 for a nonexistent topic', async () => {
		const app = await getApp();
		const admin = await signUpAndLogin('topicPatchAdmin', 'admin');
		await request(app.getHttpServer())
			.patch('/api/topics/00000000-0000-0000-0000-000000000000')
			.set('Cookie', admin.cookie)
			.send({ description: 'nope' })
			.expect(404);
	});
});
