import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp } from '../../database';
import { createTopic, signUpAndLogin } from '../../helpers';

describe('POST /api/threads — create thread', () => {
	it('creates a thread under a topic', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadTopicA');
		const user = await signUpAndLogin('threadCreateUser');

		const res = await request(app.getHttpServer())
			.post('/api/threads')
			.set('Cookie', user.cookie)
			.send({ title: 'Hello world', topicId })
			.expect(201);
		expect(res.body.title).toBe('Hello world');
		expect(res.body.topic.id).toBe(topicId);
		expect(res.body.originalPoster.id).toBe(user.userId);
	});

	it('rejects an unauthenticated request', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadTopicB');
		await request(app.getHttpServer())
			.post('/api/threads')
			.send({ title: 'No auth', topicId })
			.expect(401);
	});

	it('rejects a missing title', async () => {
		const app = await getApp();
		const topicId = await createTopic('ThreadTopicC');
		const user = await signUpAndLogin('threadCreateUser2');
		await request(app.getHttpServer())
			.post('/api/threads')
			.set('Cookie', user.cookie)
			.send({ topicId })
			.expect(400);
	});
});
