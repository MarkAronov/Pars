import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('GET /api/feed — chronological feed for the authed user', () => {
	it("includes the user's own posts and followed users' posts, not others'", async () => {
		const app = await getApp();
		const viewer = await signUpAndLogin('feedViewer');
		const followed = await signUpAndLogin('feedFollowed');
		const stranger = await signUpAndLogin('feedStranger');

		await request(app.getHttpServer())
			.post(`/api/users/${followed.userId}/follow`)
			.set('Cookie', viewer.cookie)
			.expect(200);

		const ownPost = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', viewer.cookie)
			.send({ content: 'My own post' })
			.expect(201);
		const followedPost = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', followed.cookie)
			.send({ content: 'Followed post' })
			.expect(201);
		await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', stranger.cookie)
			.send({ content: 'Stranger post' })
			.expect(201);

		const feed = await request(app.getHttpServer())
			.get('/api/feed')
			.set('Cookie', viewer.cookie)
			.expect(200);

		const ids = feed.body.posts.map((p: { id: string }) => p.id);
		expect(ids).toContain(ownPost.body.id);
		expect(ids).toContain(followedPost.body.id);
		expect(
			feed.body.posts.every(
				(p: { content: string }) => p.content !== 'Stranger post',
			),
		).toBe(true);
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		await request(app.getHttpServer()).get('/api/feed').expect(401);
	});
});
