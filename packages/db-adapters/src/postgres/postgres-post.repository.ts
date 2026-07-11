import { and, desc, eq, sql } from 'drizzle-orm';
import type { CreatePostDto, PatchPostDto } from '../dto/post.dto';
import type { PostRepository } from '../repositories/post.repository.interface';
import { postLikes, postMentions, posts, users } from '../schema';
import type { PublicPost } from '../types';
import type { DrizzleDB } from './db';

const postSelect = {
	id: posts.id,
	title: posts.title,
	content: posts.content,
	edited: posts.edited,
	createdAt: posts.createdAt,
	updatedAt: posts.updatedAt,
	threadId: posts.threadId,
	authorId: users.id,
	authorUsername: users.username,
	authorDisplayName: users.displayName,
	authorAvatarUrl: users.avatarUrl,
	authorVerified: users.verified,
	likeCount: sql<number>`(select count(*)::int from ${postLikes} where ${postLikes.postId} = ${posts.id})`,
	mentionedByCount: sql<number>`(select count(*)::int from ${postMentions} where ${postMentions.mentionedPostId} = ${posts.id})`,
};

type PostRow = {
	id: string;
	title: string | null;
	content: string;
	edited: boolean;
	createdAt: Date;
	updatedAt: Date;
	threadId: string | null;
	authorId: string;
	authorUsername: string | null;
	authorDisplayName: string | null;
	authorAvatarUrl: string | null;
	authorVerified: boolean;
	likeCount: number;
	mentionedByCount: number;
};

function toPost(r: PostRow): PublicPost {
	return {
		id: r.id,
		title: r.title,
		content: r.content,
		edited: r.edited,
		createdAt: r.createdAt,
		updatedAt: r.updatedAt,
		threadId: r.threadId,
		author: {
			id: r.authorId,
			username: r.authorUsername,
			displayName: r.authorDisplayName,
			avatarUrl: r.authorAvatarUrl,
			verified: r.authorVerified,
		},
		_count: { likes: r.likeCount, mentionedBy: r.mentionedByCount },
	};
}

export class PostgresPostRepository implements PostRepository {
	constructor(private readonly drizzle: { db: DrizzleDB }) {}

	private get db() {
		return this.drizzle.db;
	}

	async findAll(
		page: number,
		limit: number,
		authorId?: string,
	): Promise<PublicPost[]> {
		const rows = await this.db
			.select(postSelect)
			.from(posts)
			.innerJoin(users, eq(posts.authorId, users.id))
			.where(authorId ? eq(posts.authorId, authorId) : undefined)
			.orderBy(desc(posts.createdAt))
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toPost);
	}

	async findById(id: string): Promise<PublicPost | null> {
		const [row] = await this.db
			.select(postSelect)
			.from(posts)
			.innerJoin(users, eq(posts.authorId, users.id))
			.where(eq(posts.id, id));
		return row ? toPost(row) : null;
	}

	async create(authorId: string, dto: CreatePostDto): Promise<string> {
		const [inserted] = await this.db
			.insert(posts)
			.values({ ...dto, authorId })
			.returning({ id: posts.id });
		return inserted.id;
	}

	async getAuthorId(postId: string): Promise<string | null> {
		const [row] = await this.db
			.select({ authorId: posts.authorId })
			.from(posts)
			.where(eq(posts.id, postId));
		return row?.authorId ?? null;
	}

	async update(postId: string, patch: PatchPostDto): Promise<void> {
		await this.db
			.update(posts)
			.set({ ...patch, edited: true })
			.where(eq(posts.id, postId));
	}

	async delete(postId: string): Promise<void> {
		await this.db.delete(posts).where(eq(posts.id, postId));
	}

	async isLiked(postId: string, userId: string): Promise<boolean> {
		const [existing] = await this.db
			.select({ postId: postLikes.postId })
			.from(postLikes)
			.where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
		return !!existing;
	}

	async like(postId: string, userId: string): Promise<void> {
		await this.db.insert(postLikes).values({ postId, userId });
	}

	async unlike(postId: string, userId: string): Promise<void> {
		await this.db
			.delete(postLikes)
			.where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
	}
}
