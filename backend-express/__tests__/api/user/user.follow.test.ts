import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('POST/DELETE /api/users/:id/follow — follow, unfollow, isFollowing', () => {
	it('follows a user, reports isFollowing true, then unfollows', async () => {
		const app = await getApp();
		const follower = await signUpAndLogin('exprFollower');
		const followee = await signUpAndLogin('exprFollowee');

		await request(app)
			.post(`/api/users/${followee.userId}/follow`)
			.set('Cookie', follower.cookie)
			.expect(200);

		const status = await request(app)
			.get(`/api/users/${followee.userId}/following-status`)
			.set('Cookie', follower.cookie)
			.expect(200);
		expect(status.body.isFollowing).toBe(true);

		await request(app)
			.delete(`/api/users/${followee.userId}/follow`)
			.set('Cookie', follower.cookie)
			.expect(200);
	});

	it('rejects following yourself', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('exprSelfFollow');
		await request(app)
			.post(`/api/users/${user.userId}/follow`)
			.set('Cookie', user.cookie)
			.expect(400);
	});

	it('requires a session', async () => {
		const app = await getApp();
		const target = await signUpAndLogin('exprFollowTarget');
		await request(app).post(`/api/users/${target.userId}/follow`).expect(401);
	});
});
