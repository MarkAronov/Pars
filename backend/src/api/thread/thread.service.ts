import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { desc, eq, sql } from 'drizzle-orm';
import type { DrizzleService } from '../../database/drizzle.service';
import { posts, threads, topics, users } from '../../database/schema';
import type { CreateThreadDto, PatchThreadDto } from './thread.dto';

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

function toThread(r: ThreadRow) {
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

@Injectable()
export class ThreadService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll(page: number, limit: number, topicId?: string) {
		const rows = await this.drizzle.db
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

	async findById(id: string) {
		const [row] = await this.drizzle.db
			.select(threadSelect)
			.from(threads)
			.innerJoin(topics, eq(threads.topicId, topics.id))
			.innerJoin(users, eq(threads.originalPosterId, users.id))
			.where(eq(threads.id, id));
		if (!row) throw new NotFoundException('Thread not found');
		return toThread(row);
	}

	async create(userId: string, dto: CreateThreadDto) {
		const [inserted] = await this.drizzle.db
			.insert(threads)
			.values({ ...dto, originalPosterId: userId })
			.returning({ id: threads.id });
		return this.findById(inserted.id);
	}

	async patch(
		threadId: string,
		userId: string,
		userRole: string,
		dto: PatchThreadDto,
	) {
		const [existing] = await this.drizzle.db
			.select({ originalPosterId: threads.originalPosterId })
			.from(threads)
			.where(eq(threads.id, threadId));
		if (!existing) throw new NotFoundException('Thread not found');
		if (
			existing.originalPosterId !== userId &&
			userRole !== 'admin' &&
			userRole !== 'moderator'
		) {
			throw new ForbiddenException();
		}
		await this.drizzle.db
			.update(threads)
			.set(dto)
			.where(eq(threads.id, threadId));
		return this.findById(threadId);
	}

	async delete(threadId: string, userId: string, userRole: string) {
		const [existing] = await this.drizzle.db
			.select({ originalPosterId: threads.originalPosterId })
			.from(threads)
			.where(eq(threads.id, threadId));
		if (!existing) throw new NotFoundException('Thread not found');
		if (
			existing.originalPosterId !== userId &&
			userRole !== 'admin' &&
			userRole !== 'moderator'
		) {
			throw new ForbiddenException();
		}
		await this.drizzle.db.delete(threads).where(eq(threads.id, threadId));
		return { message: 'Thread deleted' };
	}
}
