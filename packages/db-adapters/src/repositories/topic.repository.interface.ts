import type { CreateTopicDto, PatchTopicDto } from '../dto/topic.dto';
import type { PublicTopic } from '../types';

export interface TopicRepository {
	findAll(page: number, limit: number): Promise<PublicTopic[]>;
	findById(id: string): Promise<PublicTopic | null>;
	create(dto: CreateTopicDto): Promise<PublicTopic>;
	update(id: string, dto: PatchTopicDto): Promise<PublicTopic>;
	delete(id: string): Promise<void>;
}
