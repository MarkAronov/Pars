import { sql } from 'drizzle-orm';
import { follows, posts, users } from '../schema';
import type { PublicUser } from '../types';

export function publicUserSelect() {
	return {
		id: users.id,
		username: users.username,
		displayName: users.displayName,
		bio: users.bio,
		avatarUrl: users.avatarUrl,
		backgroundUrl: users.backgroundUrl,
		role: users.role,
		verified: users.verified,
		createdAt: users.createdAt,
		_followers: sql<number>`(select count(*)::int from ${follows} where ${follows.followeeId} = ${users.id})`,
		_following: sql<number>`(select count(*)::int from ${follows} where ${follows.followerId} = ${users.id})`,
		_posts: sql<number>`(select count(*)::int from ${posts} where ${posts.authorId} = ${users.id})`,
	};
}

export function toPublicUser<
	T extends { _followers: number; _following: number; _posts: number },
>(row: T): PublicUser {
	const { _followers, _following, _posts, ...rest } = row;
	return {
		...rest,
		_count: { followers: _followers, following: _following, posts: _posts },
	} as unknown as PublicUser;
}
