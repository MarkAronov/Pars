import type { Db } from 'mongodb';
import type { FeedRepository } from '../repositories/feed.repository.interface';
import type { FeedPost } from '../types';
import {
	COLLECTIONS,
	type FollowDoc,
	type PostDoc,
	type UserDoc,
} from './collections';

type FeedPostDoc = PostDoc & { author: UserDoc; likeCount: number };

export class MongoFeedRepository implements FeedRepository {
	constructor(private readonly mongo: { db: Db }) {}

	private get db(): Db {
		return this.mongo.db;
	}

	async getFollowingIds(userId: string): Promise<string[]> {
		const rows = await this.db
			.collection<FollowDoc>(COLLECTIONS.follow)
			.find({ followerId: userId })
			.project<{ followeeId: string }>({ followeeId: 1, _id: 0 })
			.toArray();
		return rows.map((r) => r.followeeId);
	}

	async getFeedPosts(
		authorIds: string[],
		page: number,
		limit: number,
	): Promise<{ items: FeedPost[]; total: number }> {
		const posts = this.db.collection<PostDoc>(COLLECTIONS.post);
		const [items, total] = await Promise.all([
			posts
				.aggregate<FeedPostDoc>([
					{ $match: { authorId: { $in: authorIds } } },
					{ $sort: { createdAt: -1 } },
					{ $skip: (page - 1) * limit },
					{ $limit: limit },
					{
						$lookup: {
							from: COLLECTIONS.user,
							localField: 'authorId',
							foreignField: '_id',
							as: 'authorArr',
						},
					},
					{ $unwind: '$authorArr' },
					{
						$lookup: {
							from: COLLECTIONS.postLike,
							localField: '_id',
							foreignField: 'postId',
							as: '_likesArr',
						},
					},
					{
						$addFields: {
							author: '$authorArr',
							likeCount: { $size: '$_likesArr' },
						},
					},
					{ $project: { authorArr: 0, _likesArr: 0 } },
				])
				.toArray(),
			posts.countDocuments({ authorId: { $in: authorIds } }),
		]);

		return {
			items: items.map((d) => ({
				id: d._id,
				title: d.title,
				content: d.content,
				createdAt: d.createdAt,
				author: {
					id: d.author._id,
					username: d.author.username,
					displayName: d.author.displayName,
					avatarUrl: d.author.avatarUrl,
					verified: d.author.verified,
				},
				_count: { likes: d.likeCount },
			})),
			total,
		};
	}
}
