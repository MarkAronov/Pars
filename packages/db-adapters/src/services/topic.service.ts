import { NotFoundException } from '@nestjs/common';
import type { CreateTopicDto, PatchTopicDto } from '../dto/topic.dto';
import type { TopicRepository } from '../repositories/topic.repository.interface';

export class TopicService {
	constructor(private readonly topics: TopicRepository) {}

	async findAll(page: number, limit: number) {
		return this.topics.findAll(page, limit);
	}

	async findById(id: string) {
		const topic = await this.topics.findById(id);
		if (!topic) throw new NotFoundException('Topic not found');
		return topic;
	}

	async create(dto: CreateTopicDto) {
		return this.topics.create(dto);
	}

	async patch(id: string, dto: PatchTopicDto) {
		await this.findById(id);
		return this.topics.update(id, dto);
	}

	async delete(id: string) {
		await this.findById(id);
		await this.topics.delete(id);
		return { message: 'Topic deleted' };
	}
}
