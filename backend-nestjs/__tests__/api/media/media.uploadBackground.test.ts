import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin, TINY_PNG } from '../../helpers';

describe('POST /api/media/background — upload profile background image', () => {
	it('uploads a valid image and updates the user backgroundUrl', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('mediaBackgroundUser');

		const res = await request(app.getHttpServer())
			.post('/api/media/background')
			.set('Cookie', user.cookie)
			.attach('file', TINY_PNG, 'background.png')
			.expect(201);
		expect(res.body.url).toContain('/media/backgroundImage/');

		const me = await request(app.getHttpServer())
			.get('/api/users/me')
			.set('Cookie', user.cookie)
			.expect(200);
		expect(me.body.backgroundUrl).toBe(res.body.url);
	});
});
