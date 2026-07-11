/**
 * Shared test helpers for API tests — signup/login flow and role promotion.
 * Role promotion goes straight through Drizzle since there's no API endpoint
 * for it. Critically, it must happen BEFORE sign-in, not after: better-auth's
 * session cookieCache is populated at sign-in time (embedding the role as it
 * was at that moment), so promoting a role after login leaves the cached
 * session stuck on the old role until the cache naturally expires.
 */
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { users } from '../src/database/schema';
import { getApp, getDrizzle } from './database';

export const setRole = async (userId: string, role: 'user' | 'moderator' | 'admin') => {
	const drizzle = getDrizzle();
	await drizzle.db.update(users).set({ role }).where(eq(users.id, userId));
};

export const signUpAndLogin = async (
	emailPrefix: string,
	role?: 'user' | 'moderator' | 'admin',
) => {
	const app = await getApp();
	const email = `${emailPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
	const password = 'P@ssw0rd123!';

	const signUpRes = await request(app.getHttpServer())
		.post('/api/auth/sign-up/email')
		.send({ email, password, name: emailPrefix });
	const userId = signUpRes.body.user.id as string;

	if (role) await setRole(userId, role);

	const loginRes = await request(app.getHttpServer())
		.post('/api/auth/sign-in/email')
		.send({ email, password });

	const cookie = (loginRes.headers['set-cookie'] as unknown as string[])[0];
	return { userId, email, cookie };
};

// Smallest possible valid PNG (1x1 transparent pixel) — passes file-type's magic-byte sniffing.
export const TINY_PNG = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
	'base64',
);

export const createTopic = async (namePrefix: string): Promise<string> => {
	const app = await getApp();
	const admin = await signUpAndLogin(`${namePrefix}-admin`, 'admin');
	const res = await request(app.getHttpServer())
		.post('/api/topics')
		.set('Cookie', admin.cookie)
		.send({ name: `${namePrefix}-${Date.now()}`.slice(0, 60) })
		.expect(201);
	return res.body.id as string;
};

export const createThread = async (
	userCookie: string,
	topicId: string,
	title = 'Test thread',
): Promise<string> => {
	const app = await getApp();
	const res = await request(app.getHttpServer())
		.post('/api/threads')
		.set('Cookie', userCookie)
		.send({ title, topicId })
		.expect(201);
	return res.body.id as string;
};
