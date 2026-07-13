import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('POST /api/posts — create post', () => {
	it('creates a standalone post with no thread', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprPostAuthor');
		const res = await request(app)
			.post('/api/posts')
			.set('Cookie', user.cookie)
			.send({ content: 'Hello from Express' })
			.expect(201);
		expect(res.body.content).toBe('Hello from Express');
		expect(res.body.author.id).toBe(user.userId);
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		await request(app)
			.post('/api/posts')
			.send({ content: 'No auth' })
			.expect(401);
	});

	it('rejects empty content', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprPostInvalid');
		await request(app)
			.post('/api/posts')
			.set('Cookie', user.cookie)
			.send({ content: '' })
			.expect(400);
	});
});

describe('GET /api/posts and GET /api/posts/:id', () => {
	it('lists posts filtered by authorId and fetches one by id', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprPostFind');
		const created = await request(app)
			.post('/api/posts')
			.set('Cookie', user.cookie)
			.send({ content: 'Findable post' })
			.expect(201);

		const list = await request(app)
			.get(`/api/posts?authorId=${user.userId}`)
			.expect(200);
		expect(
			list.body.some((p: { id: string }) => p.id === created.body.id),
		).toBe(true);

		const single = await request(app)
			.get(`/api/posts/${created.body.id}`)
			.expect(200);
		expect(single.body.id).toBe(created.body.id);
	});

	it('returns 404 for a nonexistent post', async () => {
		const app = await getApp();
		await request(app)
			.get('/api/posts/00000000-0000-0000-0000-000000000000')
			.expect(404);
	});
});

describe('PATCH /api/posts/:id — edit post (owner or admin)', () => {
	it('allows the author to edit their post', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('exprPostEditor');
		const created = await request(app)
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Original' })
			.expect(201);

		const patched = await request(app)
			.patch(`/api/posts/${created.body.id}`)
			.set('Cookie', author.cookie)
			.send({ content: 'Edited' })
			.expect(200);
		expect(patched.body.content).toBe('Edited');
		expect(patched.body.edited).toBe(true);
	});

	it('rejects a different regular user', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('exprPostOwner');
		const created = await request(app)
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Protected' })
			.expect(201);

		const stranger = await signUpAndLogin('exprPostStranger');
		await request(app)
			.patch(`/api/posts/${created.body.id}`)
			.set('Cookie', stranger.cookie)
			.send({ content: 'Hijacked' })
			.expect(403);
	});
});

describe('DELETE /api/posts/:id — owner or admin', () => {
	it('allows the author to delete their post', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('exprPostDeleter');
		const created = await request(app)
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Delete me' })
			.expect(201);

		await request(app)
			.delete(`/api/posts/${created.body.id}`)
			.set('Cookie', author.cookie)
			.expect(200);
	});
});
