import type { SearchRepository } from '../repositories/search.repository.interface';

export class SearchService {
	constructor(private readonly search: SearchRepository) {}

	async searchAll(q: string, type: string, page: number, limit: number) {
		if (type === 'users') return this.search.searchUsers(q, page, limit);
		if (type === 'topics') return this.search.searchTopics(q, page, limit);
		return this.search.searchPosts(q, page, limit);
	}
}
