import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('DELETE /api/topics/:id — admin only', () => {
	it('rejects a moderator (admin-only endpoint)', async () => {
		const app = await getApp();
		const mod = await signUpAndLogin('topicDeleteMod', 'moderator');
		const created = await request(app.getHttpServer())
			.post('/api/topics')
			.set('Cookie', mod.cookie)
			.send({ name: 'Temp' })
			.expect(201);

		await request(app.getHttpServer())
			.delete(`/api/topics/${created.body.id}`)
			.set('Cookie', mod.cookie)
			.expect(403);
	});

	it('allows an admin to delete a topic', async () => {
		const app = await getApp();
		const admin = await signUpAndLogin('topicDeleteAdmin', 'admin');
		const created = await request(app.getHttpServer())
			.post('/api/topics')
			.set('Cookie', admin.cookie)
			.send({ name: 'ToDelete' })
			.expect(201);

		await request(app.getHttpServer())
			.delete(`/api/topics/${created.body.id}`)
			.set('Cookie', admin.cookie)
			.expect(200);

		await request(app.getHttpServer()).get(`/api/topics/${created.body.id}`).expect(404);
	});
});
