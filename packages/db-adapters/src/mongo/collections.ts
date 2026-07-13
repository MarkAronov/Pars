import type { Db } from 'mongodb';

// Collection names deliberately mirror the Postgres table names (singular),
// including the better-auth-managed ones (user/session/account/verification/
// twoFactor) — better-auth defaults to singular, unpluralized collection
// names, so no `usePlural`/`modelName` override is needed on its adapter.
export const COLLECTIONS = {
	user: 'user',
	session: 'session',
	account: 'account',
	verification: 'verification',
	twoFactor: 'twoFactor',
	follow: 'follow',
	post: 'post',
	postLike: 'post_like',
	postMention: 'post_mention',
	thread: 'thread',
	topic: 'topic',
	media: 'media',
} as const;

export interface UserDoc {
	_id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
	role: 'user' | 'moderator' | 'admin';
	username: string | null;
	displayName: string | null;
	bio: string;
	avatarUrl: string | null;
	backgroundUrl: string | null;
	verified: boolean;
	settings: Record<string, unknown>;
	twoFactorEnabled: boolean;
	embedding: number[] | null;
}

export interface AccountDoc {
	_id: string;
	userId: string;
	providerId: string;
	password: string | null;
}

export interface FollowDoc {
	followerId: string;
	followeeId: string;
	createdAt: Date;
}

export interface PostDoc {
	_id: string;
	title: string | null;
	content: string;
	edited: boolean;
	createdAt: Date;
	updatedAt: Date;
	embedding: number[] | null;
	authorId: string;
	threadId: string | null;
}

export interface PostLikeDoc {
	postId: string;
	userId: string;
	createdAt: Date;
}

export interface PostMentionDoc {
	mentionerPostId: string;
	mentionedPostId: string;
}

export interface ThreadDoc {
	_id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	topicId: string;
	originalPosterId: string;
}

export interface TopicDoc {
	_id: string;
	name: string;
	description: string | null;
}

export interface MediaDoc {
	_id: string;
	url: string;
	type: 'IMAGE' | 'VIDEO' | 'AVATAR' | 'BACKGROUND';
	mimeType: string;
	size: number;
	createdAt: Date;
	uploaderId: string;
	postId: string | null;
}

// Mongo has no DB-level FKs/composite PKs/enums — these indexes are the
// closest equivalent to the Postgres compound primary keys and unique
// constraints, and must be created once per database (idempotent — safe to
// call on every connection, `createIndex` no-ops if an equivalent already
// exists).
export async function ensureIndexes(db: Db): Promise<void> {
	await Promise.all([
		db.collection(COLLECTIONS.user).createIndex({ email: 1 }, { unique: true }),
		db
			.collection(COLLECTIONS.user)
			.createIndex({ username: 1 }, { unique: true, sparse: true }),
		db
			.collection(COLLECTIONS.follow)
			.createIndex({ followerId: 1, followeeId: 1 }, { unique: true }),
		db
			.collection(COLLECTIONS.postLike)
			.createIndex({ postId: 1, userId: 1 }, { unique: true }),
		db
			.collection(COLLECTIONS.postMention)
			.createIndex(
				{ mentionerPostId: 1, mentionedPostId: 1 },
				{ unique: true },
			),
		db.collection(COLLECTIONS.thread).createIndex({ topicId: 1 }),
		db.collection(COLLECTIONS.thread).createIndex({ originalPosterId: 1 }),
		db.collection(COLLECTIONS.post).createIndex({ authorId: 1 }),
		db.collection(COLLECTIONS.post).createIndex({ threadId: 1 }),
		db.collection(COLLECTIONS.media).createIndex({ uploaderId: 1 }),
	]);
}
