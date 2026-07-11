import type { FeedPost } from '../types';

export interface FeedRepository {
	getFollowingIds(userId: string): Promise<string[]>;
	getFeedPosts(
		authorIds: string[],
		page: number,
		limit: number,
	): Promise<{ items: FeedPost[]; total: number }>;
}
