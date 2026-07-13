import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin, TINY_PNG } from '../../helpers';

describe('POST /api/media/avatar — upload avatar image', () => {
	it('uploads a valid image and updates the user avatarUrl', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprMediaAvatar');
		const res = await request(app)
			.post('/api/media/avatar')
			.set('Cookie', user.cookie)
			.attach('file', TINY_PNG, 'avatar.png')
			.expect(201);
		expect(res.body.url).toBeDefined();
	});

	it('rejects a non-image file', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprMediaBadFile');
		await request(app)
			.post('/api/media/avatar')
			.set('Cookie', user.cookie)
			.attach('file', Buffer.from('not an image'), 'file.txt')
			.expect(400);
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		await request(app)
			.post('/api/media/avatar')
			.attach('file', TINY_PNG, 'avatar.png')
			.expect(401);
	});
});

describe('POST /api/media/background — upload profile background image', () => {
	it('uploads a valid image and updates the user backgroundUrl', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprMediaBackground');
		const res = await request(app)
			.post('/api/media/background')
			.set('Cookie', user.cookie)
			.attach('file', TINY_PNG, 'bg.png')
			.expect(201);
		expect(res.body.url).toBeDefined();
	});
});

describe('DELETE /api/media/:id — delete a media record and its file', () => {
	it('returns 404 for a nonexistent media record', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprMediaDelete404');
		await request(app)
			.delete('/api/media/00000000-0000-0000-0000-000000000000')
			.set('Cookie', user.cookie)
			.expect(404);
	});
});
