import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { createTopic, signUpAndLogin } from '../../helpers';

describe('GET /api/search — full-text search across posts, users, topics', () => {
	it('finds a matching post by content', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('searchPostUser');
		await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', user.cookie)
			.send({ content: 'a very unique searchable phrase xyzzy' })
			.expect(201);

		const res = await request(app.getHttpServer())
			.get('/api/search?q=xyzzy&type=posts')
			.expect(200);
		expect(
			res.body.some((p: { content: string }) => p.content.includes('xyzzy')),
		).toBe(true);
	});

	it('finds a matching user by display name', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('searchUserBase');
		// Sign-up only sets the better-auth `name` field, not `displayName` —
		// search matches username/displayName, so it must be set explicitly first.
		await request(app.getHttpServer())
			.patch('/api/users/me')
			.set('Cookie', user.cookie)
			.send({ displayName: 'SearchableDisplayName' })
			.expect(200);

		const res = await request(app.getHttpServer())
			.get('/api/search?q=SearchableDisplayName&type=users')
			.expect(200);
		expect(res.body.some((u: { id: string }) => u.id === user.userId)).toBe(
			true,
		);
	});

	it('finds a matching topic by name', async () => {
		const app = await getApp();
		const topicId = await createTopic('SearchableTopicName');
		const res = await request(app.getHttpServer())
			.get('/api/search?q=SearchableTopicName&type=topics')
			.expect(200);
		expect(res.body.some((t: { id: string }) => t.id === topicId)).toBe(true);
	});

	it('returns an empty array for no matches', async () => {
		const app = await getApp();
		const res = await request(app.getHttpServer())
			.get('/api/search?q=nonexistentqueryzzzzzzz&type=posts')
			.expect(200);
		expect(res.body).toEqual([]);
	});
});
