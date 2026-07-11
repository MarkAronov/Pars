import request from 'supertest';
import { describe, it } from 'vitest';
import { getApp } from '../../database';
import { signUpAndLogin } from '../../helpers';

describe('DELETE /api/users/:id (admin)', () => {
	it('admin can delete another user', async () => {
		const app = await getApp();
		const admin = await signUpAndLogin('deletePartialAdmin', 'admin');
		const target = await signUpAndLogin('deletePartialTarget');

		await request(app.getHttpServer())
			.delete(`/api/users/${target.userId}`)
			.set('Cookie', admin.cookie)
			.expect(200);
	});
});
