import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('GET /api/users/:id/followers and /api/users/:id/following', () => {
	it('lists followers and following after a follow', async () => {
		const app = await getApp();
		const a = await signUpAndLogin('listFollowerA');
		const b = await signUpAndLogin('listFolloweeB');

		await request(app.getHttpServer())
			.post(`/api/users/${b.userId}/follow`)
			.set('Cookie', a.cookie)
			.expect(200);

		const followers = await request(app.getHttpServer())
			.get(`/api/users/${b.userId}/followers`)
			.expect(200);
		expect(followers.body.some((u: { id: string }) => u.id === a.userId)).toBe(true);

		const following = await request(app.getHttpServer())
			.get(`/api/users/${a.userId}/following`)
			.expect(200);
		expect(following.body.some((u: { id: string }) => u.id === b.userId)).toBe(true);
	});

	it('returns an empty list for a user with no followers', async () => {
		const app = await getApp();
		const a = await signUpAndLogin('lonelyUser');
		const res = await request(app.getHttpServer())
			.get(`/api/users/${a.userId}/followers`)
			.expect(200);
		expect(res.body).toEqual([]);
	});
});
