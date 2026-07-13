import request from 'supertest';
import { describe, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('DELETE /api/posts/:id — owner or admin', () => {
	it('allows the author to delete their post', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('postDeleteAuthor');
		const created = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'To delete' })
			.expect(201);

		await request(app.getHttpServer())
			.delete(`/api/posts/${created.body.id}`)
			.set('Cookie', author.cookie)
			.expect(200);
		await request(app.getHttpServer())
			.get(`/api/posts/${created.body.id}`)
			.expect(404);
	});

	it("allows an admin to delete someone else's post", async () => {
		const app = await getApp();
		const author = await signUpAndLogin('postDeleteAuthor2');
		const created = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Admin will delete' })
			.expect(201);

		const admin = await signUpAndLogin('postDeleteAdmin', 'admin');
		await request(app.getHttpServer())
			.delete(`/api/posts/${created.body.id}`)
			.set('Cookie', admin.cookie)
			.expect(200);
	});

	it('rejects a different regular user', async () => {
		const app = await getApp();
		const author = await signUpAndLogin('postDeleteAuthor3');
		const created = await request(app.getHttpServer())
			.post('/api/posts')
			.set('Cookie', author.cookie)
			.send({ content: 'Protected' })
			.expect(201);

		const stranger = await signUpAndLogin('postDeleteStranger');
		await request(app.getHttpServer())
			.delete(`/api/posts/${created.body.id}`)
			.set('Cookie', stranger.cookie)
			.expect(403);
	});
});
