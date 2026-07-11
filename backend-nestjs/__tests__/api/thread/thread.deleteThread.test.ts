import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { createThread, createTopic, signUpAndLogin } from '../../helpers';

describe('DELETE /api/threads/:id — owner or admin', () => {
	it('allows the owner to delete their thread', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadDeleteTopicA');
		const owner = await signUpAndLogin('threadDeleteOwner');
		const threadId = await createThread(owner.cookie, topicId, 'To delete');

		await request(app.getHttpServer())
			.delete(`/api/threads/${threadId}`)
			.set('Cookie', owner.cookie)
			.expect(200);
		await request(app.getHttpServer()).get(`/api/threads/${threadId}`).expect(404);
	});

	it('rejects a different regular user', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadDeleteTopicB');
		const owner = await signUpAndLogin('threadDeleteOwner2');
		const threadId = await createThread(owner.cookie, topicId, 'Protected');

		const stranger = await signUpAndLogin('threadDeleteStranger');
		await request(app.getHttpServer())
			.delete(`/api/threads/${threadId}`)
			.set('Cookie', stranger.cookie)
			.expect(403);
	});
});
