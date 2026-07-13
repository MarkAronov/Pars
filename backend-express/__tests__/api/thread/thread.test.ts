import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { createThread, createTopic, signUpAndLogin } from '../../helpers';

describe('POST /api/threads — create thread', () => {
	it('creates a thread under a topic', async () => {
		const app = await getApp();
		const topicId = await createTopic('ExprThreadTopicA');
		const owner = await signUpAndLogin('exprThreadOwner');

		const res = await request(app)
			.post('/api/threads')
			.set('Cookie', owner.cookie)
			.send({ title: 'A new thread', topicId })
			.expect(201);
		expect(res.body.title).toBe('A new thread');
		expect(res.body.topic.id).toBe(topicId);
	});
});

describe('GET /api/threads and GET /api/threads/:id', () => {
	it('lists threads filtered by topicId and fetches one by id', async () => {
		const app = await getApp();
		const topicId = await createTopic('ExprThreadTopicB');
		const owner = await signUpAndLogin('exprThreadFind');
		const threadId = await createThread(
			owner.cookie,
			topicId,
			'Findable thread',
		);

		const list = await request(app)
			.get(`/api/threads?topicId=${topicId}`)
			.expect(200);
		expect(list.body.some((t: { id: string }) => t.id === threadId)).toBe(true);

		const single = await request(app)
			.get(`/api/threads/${threadId}`)
			.expect(200);
		expect(single.body.id).toBe(threadId);
	});
});

describe('PATCH /api/threads/:id — edit thread (owner, moderator, or admin)', () => {
	it('allows the original poster to edit their thread', async () => {
		const app = await getApp();
		const topicId = await createTopic('ExprThreadTopicC');
		const owner = await signUpAndLogin('exprThreadPatchOwner');
		const threadId = await createThread(
			owner.cookie,
			topicId,
			'Original title',
		);

		const res = await request(app)
			.patch(`/api/threads/${threadId}`)
			.set('Cookie', owner.cookie)
			.send({ title: 'Updated title' })
			.expect(200);
		expect(res.body.title).toBe('Updated title');
	});

	it('rejects a different regular user', async () => {
		const app = await getApp();
		const topicId = await createTopic('ExprThreadTopicD');
		const owner = await signUpAndLogin('exprThreadPatchOwner2');
		const threadId = await createThread(owner.cookie, topicId, 'Owned');

		const stranger = await signUpAndLogin('exprThreadStranger');
		await request(app)
			.patch(`/api/threads/${threadId}`)
			.set('Cookie', stranger.cookie)
			.send({ title: 'Hijacked' })
			.expect(403);
	});
});

describe('DELETE /api/threads/:id — owner or admin', () => {
	it('allows the owner to delete their thread', async () => {
		const app = await getApp();
		const topicId = await createTopic('ExprThreadTopicE');
		const owner = await signUpAndLogin('exprThreadDeleteOwner');
		const threadId = await createThread(owner.cookie, topicId, 'Delete me');

		await request(app)
			.delete(`/api/threads/${threadId}`)
			.set('Cookie', owner.cookie)
			.expect(200);
	});
});
