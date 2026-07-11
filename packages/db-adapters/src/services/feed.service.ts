import type { FeedRepository } from '../repositories/feed.repository.interface';
import type { FeedResult } from '../types';

export class FeedService {
	constructor(private readonly feed: FeedRepository) {}

	async getForUser(
		userId: string,
		page: number,
		limit: number,
	): Promise<FeedResult> {
		const followeeIds = await this.feed.getFollowingIds(userId);
		const authorIds = [userId, ...followeeIds];
		const { items, total } = await this.feed.getFeedPosts(
			authorIds,
			page,
			limit,
		);
		return { posts: items, total, page, limit };
	}
}
