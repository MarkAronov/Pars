import { Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { asc, eq } from 'drizzle-orm';
import type { DrizzleService } from '../../database/drizzle.service';
import { topics } from '../../database/schema';
import type { CreateTopicDto, PatchTopicDto } from './topic.dto';

@Injectable()
export class TopicService {
	constructor(private readonly drizzle: DrizzleService) {}

	findAll(page: number, limit: number) {
		return this.drizzle.db
			.select()
			.from(topics)
			.orderBy(asc(topics.name))
			.limit(limit)
			.offset((page - 1) * limit);
	}

	async findById(id: string) {
		const [topic] = await this.drizzle.db
			.select()
			.from(topics)
			.where(eq(topics.id, id));
		if (!topic) throw new NotFoundException('Topic not found');
		return topic;
	}

	async create(dto: CreateTopicDto) {
		const [topic] = await this.drizzle.db
			.insert(topics)
			.values(dto)
			.returning();
		return topic;
	}

	async patch(id: string, dto: PatchTopicDto) {
		await this.findById(id);
		const [topic] = await this.drizzle.db
			.update(topics)
			.set(dto)
			.where(eq(topics.id, id))
			.returning();
		return topic;
	}

	async delete(id: string) {
		await this.findById(id);
		await this.drizzle.db.delete(topics).where(eq(topics.id, id));
		return { message: 'Topic deleted' };
	}
}
