import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { createTopic, signUpAndLogin } from '../../helpers';

describe('GET /api/search — full-text search across posts, users, topics', () => {
	it('finds a matching post by content', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprSearchPostAuthor');
		await request(app)
			.post('/api/posts')
			.set('Cookie', user.cookie)
			.send({ content: 'searchable unicorn content' })
			.expect(201);

		const res = await request(app)
			.get('/api/search?q=unicorn&type=posts')
			.expect(200);
		expect(
			res.body.some((p: { content: string }) => p.content.includes('unicorn')),
		).toBe(true);
	});

	it('finds a matching user by display name', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprSearchUser');
		await request(app)
			.patch('/api/users/me')
			.set('Cookie', user.cookie)
			.send({ displayName: 'SearchableGiraffe' })
			.expect(200);

		const res = await request(app)
			.get('/api/search?q=Giraffe&type=users')
			.expect(200);
		expect(
			res.body.some((u: { displayName: string }) =>
				u.displayName.includes('Giraffe'),
			),
		).toBe(true);
	});

	it('finds a matching topic by name', async () => {
		const app = await getApp();
		const topicId = await createTopic('SearchableZebraTopic');
		const res = await request(app)
			.get('/api/search?q=SearchableZebraTopic&type=topics')
			.expect(200);
		expect(res.body.some((t: { id: string }) => t.id === topicId)).toBe(true);
	});

	it('returns an empty array for no matches', async () => {
		const app = await getApp();
		const res = await request(app)
			.get('/api/search?q=nonexistentquery12345&type=posts')
			.expect(200);
		expect(res.body).toEqual([]);
	});
});
