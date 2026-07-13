import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { createThread, createTopic, signUpAndLogin } from '../../helpers';

describe('GET /api/threads and GET /api/threads/:id', () => {
	it('lists threads filtered by topicId and fetches one by id', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadListTopic');
		const user = await signUpAndLogin('threadListUser');
		const threadId = await createThread(
			user.cookie,
			topicId,
			'Filtered thread',
		);

		const list = await request(app.getHttpServer())
			.get(`/api/threads?topicId=${topicId}`)
			.expect(200);
		expect(list.body.some((t: { id: string }) => t.id === threadId)).toBe(true);

		const single = await request(app.getHttpServer())
			.get(`/api/threads/${threadId}`)
			.expect(200);
		expect(single.body.title).toBe('Filtered thread');
		expect(single.body._count.posts).toBe(0);
	});

	it('returns 404 for a nonexistent thread', async () => {
		const app = await getApp();
		await request(app.getHttpServer())
			.get('/api/threads/00000000-0000-0000-0000-000000000000')
			.expect(404);
	});
});
