import type { CreateThreadDto, PatchThreadDto } from '../dto/thread.dto';
import type { PublicThread } from '../types';

export interface ThreadRepository {
	findAll(
		page: number,
		limit: number,
		topicId?: string,
	): Promise<PublicThread[]>;
	findById(id: string): Promise<PublicThread | null>;
	create(userId: string, dto: CreateThreadDto): Promise<string>;
	getOriginalPosterId(threadId: string): Promise<string | null>;
	update(threadId: string, patch: PatchThreadDto): Promise<void>;
	delete(threadId: string): Promise<void>;
}
