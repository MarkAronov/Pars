import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('GET /api/topics and GET /api/topics/:id', () => {
	it('lists topics and fetches one by id', async () => {
		const app = await getApp();
		const admin = await signUpAndLogin('topicListAdmin', 'admin');

		const created = await request(app.getHttpServer())
			.post('/api/topics')
			.set('Cookie', admin.cookie)
			.send({ name: 'Gaming' })
			.expect(201);

		const list = await request(app.getHttpServer())
			.get('/api/topics')
			.expect(200);
		expect(
			list.body.some((t: { id: string }) => t.id === created.body.id),
		).toBe(true);

		const single = await request(app.getHttpServer())
			.get(`/api/topics/${created.body.id}`)
			.expect(200);
		expect(single.body.name).toBe('Gaming');
	});

	it('returns 404 for a nonexistent topic', async () => {
		const app = await getApp();
		await request(app.getHttpServer())
			.get('/api/topics/00000000-0000-0000-0000-000000000000')
			.expect(404);
	});
});
