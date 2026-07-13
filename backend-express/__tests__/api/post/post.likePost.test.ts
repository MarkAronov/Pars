import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('POST /api/posts/:id/like — toggle like', () => {
	it('likes then unlikes a post, updating the like count', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('exprLikeAuthor');
		const created = await request(app)
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Likeable post' })
			.expect(201);

		const liker = await signUpAndLogin('exprLikeLiker');
		const liked = await request(app)
			.post(`/api/posts/${created.body.id}/like`)
			.set('Cookie', liker.cookie)
			.expect(201);
		expect(liked.body.liked).toBe(true);

		const fetched = await request(app)
			.get(`/api/posts/${created.body.id}`)
			.expect(200);
		expect(fetched.body._count.likes).toBe(1);

		const unliked = await request(app)
			.post(`/api/posts/${created.body.id}/like`)
			.set('Cookie', liker.cookie)
			.expect(201);
		expect(unliked.body.liked).toBe(false);
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('exprLikeAuthor2');
		const created = await request(app)
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Needs auth to like' })
			.expect(201);

		await request(app).post(`/api/posts/${created.body.id}/like`).expect(401);
	});
});
