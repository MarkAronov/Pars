import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('GET /api/posts and GET /api/posts/:id', () => {
	it('lists posts filtered by authorId and fetches one by id', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('postListUser');
		const created = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', user.cookie)
			.send({ content: 'Findable post' })
			.expect(201);

		const list = await request(app.getHttpServer())
			.get(`/api/posts?authorId=${user.userId}`)
			.expect(200);
		expect(
			list.body.some((p: { id: string }) => p.id === created.body.id),
		).toBe(true);

		const single = await request(app.getHttpServer())
			.get(`/api/posts/${created.body.id}`)
			.expect(200);
		expect(single.body.content).toBe('Findable post');
	});

	it('returns 404 for a nonexistent post', async () => {
		const app = await getApp();
		await request(app.getHttpServer())
			.get('/api/posts/00000000-0000-0000-0000-000000000000')
			.expect(404);
	});
});
