import { COLLECTIONS } from '@pars/db-adapters';
import { media } from '@pars/db-adapters/schema';
import request from 'supertest';
import { describe, it } from 'vitest';
import { getApp, getDrizzle, getMongo } from '../../database';
import { signUpAndLogin, TINY_PNG } from '../../helpers';

describe('DELETE /api/media/:id — delete a media record and its file', () => {
	it('deletes an uploaded avatar media record', async () => {
		const app = await getApp();
		const user = await signUpAndLogin('mediaDeleteUser');

		await request(app.getHttpServer())
			.post('/api/media/avatar')
			.set('Cookie', user.cookie)
			.attach('file', TINY_PNG, 'avatar.png')
			.expect(201);

		const id =
			process.env.DATABASE_DRIVER === 'mongo'
				? ((await getMongo().db.collection(COLLECTIONS.media).findOne({}))
						?._id as string)
				: (
						await getDrizzle().db.select({ id: media.id }).from(media).limit(1)
					)[0].id;

		await request(app.getHttpServer())
			.delete(`/api/media/${id}`)
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
