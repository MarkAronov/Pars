import type { PublicTopic, SearchPostResult, SearchUserResult } from '../types';

export interface SearchRepository {
	searchUsers(
		q: string,
		page: number,
		limit: number,
	): Promise<SearchUserResult[]>;
	searchPosts(
		q: string,
		page: number,
		limit: number,
	): Promise<SearchPostResult[]>;
	searchTopics(q: string, page: number, limit: number): Promise<PublicTopic[]>;
}
