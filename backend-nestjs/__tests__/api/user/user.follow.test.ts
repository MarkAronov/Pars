import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('POST/DELETE /api/users/:id/follow — follow, unfollow, isFollowing', () => {
	it('follows a user, reports isFollowing true, then unfollows', async () => {
		const app = await getApp();
		const a = await signUpAndLogin('followerA');
		const b = await signUpAndLogin('followeeB');

		const followRes = await request(app.getHttpServer())
			.post(`/api/users/${b.userId}/follow`)
			.set('Cookie', a.cookie)
			.expect(200);
		expect(followRes.body.following).toBe(true);

		const statusRes = await request(app.getHttpServer())
			.get(`/api/users/${b.userId}/following-status`)
			.set('Cookie', a.cookie)
			.expect(200);
		expect(statusRes.body.isFollowing).toBe(true);

		const unfollowRes = await request(app.getHttpServer())
			.delete(`/api/users/${b.userId}/follow`)
			.set('Cookie', a.cookie)
			.expect(200);
		expect(unfollowRes.body.following).toBe(false);
	});

	it('rejects following yourself', async () => {
		const app = await getApp();
		const a = await signUpAndLogin('selfFollow');

		await request(app.getHttpServer())
			.post(`/api/users/${a.userId}/follow`)
			.set('Cookie', a.cookie)
			.expect(400);
	});

	it('rejects following twice', async () => {
		const app = await getApp();
		const a = await signUpAndLogin('dupFollowerA');
		const b = await signUpAndLogin('dupFolloweeB');

		await request(app.getHttpServer())
			.post(`/api/users/${b.userId}/follow`)
			.set('Cookie', a.cookie)
			.expect(200);
		await request(app.getHttpServer())
			.post(`/api/users/${b.userId}/follow`)
			.set('Cookie', a.cookie)
			.expect(409);
	});

	it('rejects unfollowing a user not followed', async () => {
		const app = await getApp();
		const a = await signUpAndLogin('notFollowingA');
		const b = await signUpAndLogin('notFollowingB');

		await request(app.getHttpServer())
			.delete(`/api/users/${b.userId}/follow`)
			.set('Cookie', a.cookie)
			.expect(404);
	});

	it('requires a session', async () => {
		const app = await getApp();
		const b = await signUpAndLogin('unauthedFolloweeB');
		await request(app.getHttpServer())
			.post(`/api/users/${b.userId}/follow`)
			.expect(401);
	});
});
