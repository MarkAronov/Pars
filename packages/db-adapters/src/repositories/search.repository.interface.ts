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
	// Postgres-only — see the plan's documented Mongo/semantic-search
	// asymmetry (self-hosted MongoDB has no native vector search).
	searchPostsSemantic(
		queryEmbedding: number[],
		limit: number,
	): Promise<SearchPostResult[]>;
}
