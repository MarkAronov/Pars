/**
 * Shared test helpers — mirrors backend-nestjs/__tests__/helpers.ts. Role
 * promotion goes straight through the DB since there's no API endpoint for
 * it, and critically must happen BEFORE sign-in — see the Nest version's
 * comment for why (better-auth's session cookieCache captures role at
 * sign-in time).
 */
import { COLLECTIONS } from '@pars/db-adapters';
import { users } from '@pars/db-adapters/schema';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { getApp, getDrizzle, getMongo } from './database';

export const setRole = async (
	userId: string,
	role: 'user' | 'moderator' | 'admin',
) => {
	if (process.env.DATABASE_DRIVER === 'mongo') {
		const mongo = getMongo();
		await mongo
			?.collection(COLLECTIONS.user)
			.updateOne({ _id: userId }, { $set: { role } });
		return;
	}
	const drizzle = getDrizzle();
	await drizzle?.update(users).set({ role }).where(eq(users.id, userId));
};

export const signUpAndLogin = async (
	emailPrefix: string,
	role?: 'user' | 'moderator' | 'admin',
) => {
	const app = await getApp();
	const email = `${emailPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
	const password = 'P@ssw0rd123!';

	const signUpRes = await request(app)
		.post('/api/auth/sign-up/email')
		.send({ email, password, name: emailPrefix });
	const userId = signUpRes.body.user.id as string;

	if (role) await setRole(userId, role);

	const loginRes = await request(app)
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
	const res = await request(app)
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
	const res = await request(app)
		.post('/api/threads')
		.set('Cookie', userCookie)
		.send({ title, topicId })
		.expect(201);
	return res.body.id as string;
};
