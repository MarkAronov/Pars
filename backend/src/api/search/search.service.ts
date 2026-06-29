import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { eq, ilike, or } from 'drizzle-orm';
import type { DrizzleService } from '../../database/drizzle.service';
import { posts, topics, users } from '../../database/schema';

@Injectable()
export class SearchService {
	constructor(private readonly drizzle: DrizzleService) {}

	async search(q: string, type: string, page: number, limit: number) {
		const skip = (page - 1) * limit;

		if (type === 'users') {
			return this.drizzle.db
				.select({
					id: users.id,
					username: users.username,
					displayName: users.displayName,
					avatarUrl: users.avatarUrl,
					verified: users.verified,
				})
				.from(users)
				.where(
					or(
						ilike(users.username, `%${q}%`),
						ilike(users.displayName, `%${q}%`),
					),
				)
				.limit(limit)
				.offset(skip);
		}

		if (type === 'topics') {
			return this.drizzle.db
				.select()
				.from(topics)
				.where(ilike(topics.name, `%${q}%`))
				.limit(limit)
				.offset(skip);
		}

		// Default: posts
		const rows = await this.drizzle.db
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
			.offset(skip);

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
