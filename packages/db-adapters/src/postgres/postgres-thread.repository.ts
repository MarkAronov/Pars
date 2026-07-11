import { desc, eq, sql } from 'drizzle-orm';
import type { CreateThreadDto, PatchThreadDto } from '../dto/thread.dto';
import type { ThreadRepository } from '../repositories/thread.repository.interface';
import { posts, threads, topics, users } from '../schema';
import type { PublicThread } from '../types';
import type { DrizzleDB } from './db';

const threadSelect = {
	id: threads.id,
	title: threads.title,
	createdAt: threads.createdAt,
	updatedAt: threads.updatedAt,
	topicId: topics.id,
	topicName: topics.name,
	posterId: users.id,
	posterUsername: users.username,
	posterDisplayName: users.displayName,
	posterAvatarUrl: users.avatarUrl,
	postCount: sql<number>`(select count(*)::int from ${posts} where ${posts.threadId} = ${threads.id})`,
};

type ThreadRow = {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	topicId: string;
	topicName: string;
	posterId: string;
	posterUsername: string | null;
	posterDisplayName: string | null;
	posterAvatarUrl: string | null;
	postCount: number;
};

function toThread(r: ThreadRow): PublicThread {
	return {
		id: r.id,
		title: r.title,
		createdAt: r.createdAt,
		updatedAt: r.updatedAt,
		topic: { id: r.topicId, name: r.topicName },
		originalPoster: {
			id: r.posterId,
			username: r.posterUsername,
			displayName: r.posterDisplayName,
			avatarUrl: r.posterAvatarUrl,
		},
		_count: { posts: r.postCount },
	};
}

export class PostgresThreadRepository implements ThreadRepository {
	constructor(private readonly drizzle: { db: DrizzleDB }) {}

	private get db() {
		return this.drizzle.db;
	}

	async findAll(
		page: number,
		limit: number,
		topicId?: string,
	): Promise<PublicThread[]> {
		const rows = await this.db
			.select(threadSelect)
			.from(threads)
			.innerJoin(topics, eq(threads.topicId, topics.id))
			.innerJoin(users, eq(threads.originalPosterId, users.id))
			.where(topicId ? eq(threads.topicId, topicId) : undefined)
			.orderBy(desc(threads.createdAt))
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toThread);
	}

	async findById(id: string): Promise<PublicThread | null> {
		const [row] = await this.db
			.select(threadSelect)
			.from(threads)
			.innerJoin(topics, eq(threads.topicId, topics.id))
			.innerJoin(users, eq(threads.originalPosterId, users.id))
			.where(eq(threads.id, id));
		return row ? toThread(row) : null;
	}

	async create(userId: string, dto: CreateThreadDto): Promise<string> {
		const [inserted] = await this.db
			.insert(threads)
			.values({ ...dto, originalPosterId: userId })
			.returning({ id: threads.id });
		return inserted.id;
	}

	async getOriginalPosterId(threadId: string): Promise<string | null> {
		const [row] = await this.db
			.select({ originalPosterId: threads.originalPosterId })
			.from(threads)
			.where(eq(threads.id, threadId));
		return row?.originalPosterId ?? null;
	}

	async update(threadId: string, patch: PatchThreadDto): Promise<void> {
		await this.db.update(threads).set(patch).where(eq(threads.id, threadId));
	}

	async delete(threadId: string): Promise<void> {
		await this.db.delete(threads).where(eq(threads.id, threadId));
	}
}
