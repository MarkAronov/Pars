import { eq, ilike, or } from 'drizzle-orm';
import type { SearchRepository } from '../repositories/search.repository.interface';
import { posts, topics, users } from '../schema';
import type { PublicTopic, SearchPostResult, SearchUserResult } from '../types';
import type { DrizzleDB } from './db';

export class PostgresSearchRepository implements SearchRepository {
	constructor(private readonly drizzle: { db: DrizzleDB }) {}

	private get db() {
		return this.drizzle.db;
	}

	async searchUsers(
		q: string,
		page: number,
		limit: number,
	): Promise<SearchUserResult[]> {
		return this.db
			.select({
				id: users.id,
				username: users.username,
				displayName: users.displayName,
				avatarUrl: users.avatarUrl,
				verified: users.verified,
			})
			.from(users)
			.where(
				or(ilike(users.username, `%${q}%`), ilike(users.displayName, `%${q}%`)),
			)
			.limit(limit)
			.offset((page - 1) * limit);
	}

	async searchTopics(
		q: string,
		page: number,
		limit: number,
	): Promise<PublicTopic[]> {
		return this.db
			.select()
			.from(topics)
			.where(ilike(topics.name, `%${q}%`))
			.limit(limit)
			.offset((page - 1) * limit);
	}

	async searchPosts(
		q: string,
		page: number,
		limit: number,
	): Promise<SearchPostResult[]> {
		const rows = await this.db
			.select({
				id: posts.id,
				title: posts.title,
				content: posts.content,
				createdAt: posts.createdAt,
				authorId: users.id,
				authorUsername: users.username,
				authorDisplayName: users.displayName,
				authorAvatarUrl: users.avatarUrl,
			})
			.from(posts)
			.innerJoin(users, eq(posts.authorId, users.id))
			.where(or(ilike(posts.title, `%${q}%`), ilike(posts.content, `%${q}%`)))
			.limit(limit)
			.offset((page - 1) * limit);

		return rows.map((r) => ({
			id: r.id,
			title: r.title,
			content: r.content,
			createdAt: r.createdAt,
			author: {
				id: r.authorId,
				username: r.authorUsername,
				displayName: r.authorDisplayName,
				avatarUrl: r.authorAvatarUrl,
			},
		}));
	}
}
