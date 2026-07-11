import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getApp, getDrizzle } from '../../database';
import { media } from '../../../src/database/schema';
import { TINY_PNG, signUpAndLogin } from '../../helpers';

describe('DELETE /api/media/:id — delete a media record and its file', () => {
	it('deletes an uploaded avatar media record', async () => {
		const app = await getApp();
		const drizzle = getDrizzle();
		const user = await signUpAndLogin('mediaDeleteUser');

		await request(app.getHttpServer())
			.post('/api/media/avatar')
			.set('Cookie', user.cookie)
			.attach('file', TINY_PNG, 'avatar.png')
			.expect(201);

		const [row] = await drizzle.db.select({ id: media.id }).from(media).limit(1);

		await request(app.getHttpServer())
			.delete(`/api/media/${row.id}`)
			.set('Cookie', user.cookie)
			.expect(200);
	});

	it('returns 404 for a nonexistent media record', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('mediaDeleteUser2');
		await request(app.getHttpServer())
			.delete('/api/media/00000000-0000-0000-0000-000000000000')
			.set('Cookie', user.cookie)
			.expect(404);
	});
});
