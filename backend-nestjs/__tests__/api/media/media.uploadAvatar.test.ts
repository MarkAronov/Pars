import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { TINY_PNG, signUpAndLogin } from '../../helpers';

describe('POST /api/media/avatar — upload avatar image', () => {
	it('uploads a valid image and updates the user avatarUrl', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('mediaAvatarUser');

		const res = await request(app.getHttpServer())
			.post('/api/media/avatar')
			.set('Cookie', user.cookie)
			.attach('file', TINY_PNG, 'avatar.png')
			.expect(201);
		expect(res.body.url).toContain('/media/avatar/');

		const me = await request(app.getHttpServer())
			.get('/api/users/me')
			.set('Cookie', user.cookie)
			.expect(200);
		expect(me.body.avatarUrl).toBe(res.body.url);
	});

	it('rejects a non-image file', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('mediaAvatarUser2');
		await request(app.getHttpServer())
			.post('/api/media/avatar')
			.set('Cookie', user.cookie)
			.attach('file', Buffer.from('not an image'), 'file.txt')
			.expect(400);
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		await request(app.getHttpServer())
			.post('/api/media/avatar')
			.attach('file', TINY_PNG, 'avatar.png')
			.expect(401);
	});
});
