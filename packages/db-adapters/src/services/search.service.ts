import { ServiceUnavailableException } from '@nestjs/common';
import type { SearchRepository } from '../repositories/search.repository.interface';
import { embedText } from '../search/embeddings';

export class SearchService {
	constructor(private readonly search: SearchRepository) {}

	async searchAll(q: string, type: string, page: number, limit: number) {
		if (type === 'users') return this.search.searchUsers(q, page, limit);
		if (type === 'topics') return this.search.searchTopics(q, page, limit);
		if (type === 'semantic') {
			const queryEmbedding = await embedText(q);
			if (!queryEmbedding) {
				throw new ServiceUnavailableException(
					'Semantic search requires OPENAI_API_KEY to be configured',
				);
			}
			return this.search.searchPostsSemantic(queryEmbedding, limit);
		}
		return this.search.searchPosts(q, page, limit);
	}
}
