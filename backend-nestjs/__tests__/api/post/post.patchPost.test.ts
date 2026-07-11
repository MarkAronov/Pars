import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('PATCH /api/posts/:id — edit post (owner or admin)', () => {
	it('allows the author to edit their post', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('postPatchAuthor');
		const created = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Original' })
			.expect(201);

		const patched = await request(app.getHttpServer())
			.patch(`/api/posts/${created.body.id}`)
			.set('Cookie', author.cookie)
			.send({ content: 'Edited' })
			.expect(200);
		expect(patched.body.content).toBe('Edited');
		expect(patched.body.edited).toBe(true);
	});

	it('rejects a different regular user', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('postPatchAuthor2');
		const created = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Protected' })
			.expect(201);

		const stranger = await signUpAndLogin('postPatchStranger');
		await request(app.getHttpServer())
			.patch(`/api/posts/${created.body.id}`)
			.set('Cookie', stranger.cookie)
			.send({ content: 'Hijacked' })
			.expect(403);
	});
});
