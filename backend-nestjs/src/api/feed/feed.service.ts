import { Injectable } from '@nestjs/common';
import { desc, eq, inArray, sql } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { DrizzleService } from '../../database/drizzle.service';
import { follows, postLikes, posts, users } from '../../database/schema';

@Injectable()
export class FeedService {
	constructor(private readonly drizzle: DrizzleService) {}

	async getForUser(userId: string, page: number, limit: number) {
		const skip = (page - 1) * limit;

		const followingRows = await this.drizzle.db
			.select({ followeeId: follows.followeeId })
			.from(follows)
			.where(eq(follows.followerId, userId));
		const authorIds = [userId, ...followingRows.map((f) => f.followeeId)];

		const [feedPosts, totalRows] = await Promise.all([
			this.drizzle.db
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
			this.drizzle.db
				.select({ count: sql<number>`count(*)::int` })
				.from(posts)
				.where(inArray(posts.authorId, authorIds)),
		]);

		return {
			posts: feedPosts.map((r) => ({
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
			page,
			limit,
		};
	}
}
