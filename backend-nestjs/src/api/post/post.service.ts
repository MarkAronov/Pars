import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { DrizzleService } from '../../database/drizzle.service';
import { postLikes, postMentions, posts, users } from '../../database/schema';
import type { CreatePostDto, PatchPostDto } from './post.dto';

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

function toPost(r: PostRow) {
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

@Injectable()
export class PostService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll(page: number, limit: number, authorId?: string) {
		const rows = await this.drizzle.db
			.select(postSelect)
			.from(posts)
			.innerJoin(users, eq(posts.authorId, users.id))
			.where(authorId ? eq(posts.authorId, authorId) : undefined)
			.orderBy(desc(posts.createdAt))
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toPost);
	}

	async findById(id: string) {
		const [row] = await this.drizzle.db
			.select(postSelect)
			.from(posts)
			.innerJoin(users, eq(posts.authorId, users.id))
			.where(eq(posts.id, id));
		if (!row) throw new NotFoundException('Post not found');
		return toPost(row);
	}

	async create(authorId: string, dto: CreatePostDto) {
		const [inserted] = await this.drizzle.db
			.insert(posts)
			.values({ ...dto, authorId })
			.returning({ id: posts.id });
		return this.findById(inserted.id);
	}

	async patch(
		postId: string,
		userId: string,
		userRole: string,
		dto: PatchPostDto,
	) {
		const [existing] = await this.drizzle.db
			.select({ authorId: posts.authorId })
			.from(posts)
			.where(eq(posts.id, postId));
		if (!existing) throw new NotFoundException('Post not found');
		if (existing.authorId !== userId && userRole !== 'admin')
			throw new ForbiddenException();
		await this.drizzle.db
			.update(posts)
			.set({ ...dto, edited: true })
			.where(eq(posts.id, postId));
		return this.findById(postId);
	}

	async delete(postId: string, userId: string, userRole: string) {
		const [existing] = await this.drizzle.db
			.select({ authorId: posts.authorId })
			.from(posts)
			.where(eq(posts.id, postId));
		if (!existing) throw new NotFoundException('Post not found');
		if (existing.authorId !== userId && userRole !== 'admin')
			throw new ForbiddenException();
		await this.drizzle.db.delete(posts).where(eq(posts.id, postId));
		return { message: 'Post deleted' };
	}

	async toggleLike(postId: string, userId: string) {
		const [existing] = await this.drizzle.db
			.select({ postId: postLikes.postId })
			.from(postLikes)
			.where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
		if (existing) {
			await this.drizzle.db
				.delete(postLikes)
				.where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
			return { liked: false };
		}
		await this.drizzle.db.insert(postLikes).values({ postId, userId });
		return { liked: true };
	}
}
