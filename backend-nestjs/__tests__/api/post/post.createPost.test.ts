import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('POST /api/posts — create post', () => {
	it('creates a standalone post with no thread', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('postCreateUser');
		const res = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', user.cookie)
			.send({ content: 'Hello, world!' })
			.expect(201);
		expect(res.body.content).toBe('Hello, world!');
		expect(res.body.author.id).toBe(user.userId);
		expect(res.body._count.likes).toBe(0);
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		await request(app.getHttpServer())
			.post('/api/posts')
			.send({ content: 'No auth' })
			.expect(401);
	});

	it('rejects empty content', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('postCreateUser2');
		await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', user.cookie)
			.send({ content: '' })
			.expect(400);
	});
});
