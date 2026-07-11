import { asc, eq } from 'drizzle-orm';
import type { CreateTopicDto, PatchTopicDto } from '../dto/topic.dto';
import type { TopicRepository } from '../repositories/topic.repository.interface';
import { topics } from '../schema';
import type { PublicTopic } from '../types';
import type { DrizzleDB } from './db';

export class PostgresTopicRepository implements TopicRepository {
	constructor(private readonly drizzle: { db: DrizzleDB }) {}

	private get db() {
		return this.drizzle.db;
	}

	async findAll(page: number, limit: number): Promise<PublicTopic[]> {
		return this.db
			.select()
			.from(topics)
			.orderBy(asc(topics.name))
			.limit(limit)
			.offset((page - 1) * limit);
	}

	async findById(id: string): Promise<PublicTopic | null> {
		const [topic] = await this.db
			.select()
			.from(topics)
			.where(eq(topics.id, id));
		return topic ?? null;
	}

	async create(dto: CreateTopicDto): Promise<PublicTopic> {
		const [topic] = await this.db.insert(topics).values(dto).returning();
		return topic;
	}

	async update(id: string, dto: PatchTopicDto): Promise<PublicTopic> {
		const [topic] = await this.db
			.update(topics)
			.set(dto)
			.where(eq(topics.id, id))
			.returning();
		return topic;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(topics).where(eq(topics.id, id));
	}
}
