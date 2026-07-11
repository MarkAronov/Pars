import { desc, eq, inArray, sql } from 'drizzle-orm';
import type { FeedRepository } from '../repositories/feed.repository.interface';
import { follows, postLikes, posts, users } from '../schema';
import type { FeedPost } from '../types';
import type { DrizzleDB } from './db';

export class PostgresFeedRepository implements FeedRepository {
	constructor(private readonly drizzle: { db: DrizzleDB }) {}

	private get db() {
		return this.drizzle.db;
	}

	async getFollowingIds(userId: string): Promise<string[]> {
		const rows = await this.db
			.select({ followeeId: follows.followeeId })
			.from(follows)
			.where(eq(follows.followerId, userId));
		return rows.map((f) => f.followeeId);
	}

	async getFeedPosts(
		authorIds: string[],
		page: number,
		limit: number,
	): Promise<{ items: FeedPost[]; total: number }> {
		const skip = (page - 1) * limit;

		const [feedPosts, totalRows] = await Promise.all([
			this.db
				.select({
					id: posts.id,
					title: posts.title,
					content: posts.content,
					createdAt: posts.createdAt,
					authorId: users.id,
					authorUsername: users.username,
					authorDisplayName: users.displayName,
					authorAvatarUrl: users.avatarUrl,
					authorVerified: users.verified,
					likeCount: sql<number>`(select count(*)::int from ${postLikes} where ${postLikes.postId} = ${posts.id})`,
				})
				.from(posts)
				.innerJoin(users, eq(posts.authorId, users.id))
				.where(inArray(posts.authorId, authorIds))
				.orderBy(desc(posts.createdAt))
				.limit(limit)
				.offset(skip),
			this.db
				.select({ count: sql<number>`count(*)::int` })
				.from(posts)
				.where(inArray(posts.authorId, authorIds)),
		]);

		return {
			items: feedPosts.map((r) => ({
				id: r.id,
				title: r.title,
				content: r.content,
				createdAt: r.createdAt,
				author: {
					id: r.authorId,
					username: r.authorUsername,
					displayName: r.authorDisplayName,
					avatarUrl: r.authorAvatarUrl,
					verified: r.authorVerified,
				},
				_count: { likes: r.likeCount },
			})),
			total: totalRows[0]?.count ?? 0,
		};
	}
}
