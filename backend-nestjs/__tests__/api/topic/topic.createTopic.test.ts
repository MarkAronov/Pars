import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('POST /api/topics — create topic (moderator/admin only)', () => {
	it('rejects a regular user', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('topicCreateUser');
		await request(app.getHttpServer())
			.post('/api/topics')
			.set('Cookie', user.cookie)
			.send({ name: 'General' })
			.expect(403);
	});

	it('allows a moderator to create a topic', async () => {
		const app = await getApp();
		const mod = await signUpAndLogin('topicCreateMod', 'moderator');

		const res = await request(app.getHttpServer())
			.post('/api/topics')
			.set('Cookie', mod.cookie)
			.send({ name: 'Announcements', description: 'Site news' })
			.expect(201);
		expect(res.body.name).toBe('Announcements');
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		await request(app.getHttpServer()).post('/api/topics').send({ name: 'NoAuth' }).expect(401);
	});

	it('rejects an invalid payload', async () => {
		const app = await getApp();
		const admin = await signUpAndLogin('topicCreateAdmin', 'admin');
		await request(app.getHttpServer())
			.post('/api/topics')
			.set('Cookie', admin.cookie)
			.send({ name: '' })
			.expect(400);
	});
});
