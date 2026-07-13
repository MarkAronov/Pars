import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('POST /api/posts/:id/like — toggle like', () => {
	it('likes then unlikes a post, updating the like count', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('postLikeAuthor');
		const created = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Likeable post' })
			.expect(201);

		const liker = await signUpAndLogin('postLikeLiker');
		const likeRes = await request(app.getHttpServer())
			.post(`/api/posts/${created.body.id}/like`)
			.set('Cookie', liker.cookie)
			.expect(201);
		expect(likeRes.body.liked).toBe(true);

		const afterLike = await request(app.getHttpServer())
			.get(`/api/posts/${created.body.id}`)
			.expect(200);
		expect(afterLike.body._count.likes).toBe(1);

		const unlikeRes = await request(app.getHttpServer())
			.post(`/api/posts/${created.body.id}/like`)
			.set('Cookie', liker.cookie)
			.expect(201);
		expect(unlikeRes.body.liked).toBe(false);

		const afterUnlike = await request(app.getHttpServer())
			.get(`/api/posts/${created.body.id}`)
			.expect(200);
		expect(afterUnlike.body._count.likes).toBe(0);
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('postLikeAuthor2');
		const created = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Needs auth to like' })
			.expect(201);

		await request(app.getHttpServer())
			.post(`/api/posts/${created.body.id}/like`)
			.expect(401);
	});
});
