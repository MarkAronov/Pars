import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { createThread, createTopic, signUpAndLogin } from '../../helpers';

describe('PATCH /api/threads/:id — edit thread (owner, moderator, or admin)', () => {
	it('allows the original poster to edit their thread', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadPatchTopicA');
		const owner = await signUpAndLogin('threadPatchOwner');
		const threadId = await createThread(owner.cookie, topicId, 'Original title');

		const res = await request(app.getHttpServer())
			.patch(`/api/threads/${threadId}`)
			.set('Cookie', owner.cookie)
			.send({ title: 'Updated title' })
			.expect(200);
		expect(res.body.title).toBe('Updated title');
	});

	it('allows a moderator to edit someone else\'s thread', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadPatchTopicB');
		const owner = await signUpAndLogin('threadPatchOwner2');
		const threadId = await createThread(owner.cookie, topicId, 'Owned by owner2');

		const mod = await signUpAndLogin('threadPatchMod', 'moderator');
		await request(app.getHttpServer())
			.patch(`/api/threads/${threadId}`)
			.set('Cookie', mod.cookie)
			.send({ title: 'Moderated title' })
			.expect(200);
	});

	it('rejects a different regular user', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadPatchTopicC');
		const owner = await signUpAndLogin('threadPatchOwner3');
		const threadId = await createThread(owner.cookie, topicId, 'Owned by owner3');

		const stranger = await signUpAndLogin('threadPatchStranger');
		await request(app.getHttpServer())
			.patch(`/api/threads/${threadId}`)
			.set('Cookie', stranger.cookie)
			.send({ title: 'Hijacked' })
			.expect(403);
	});
});
