import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { CreateThreadDto, PatchThreadDto } from '../dto/thread.dto';
import type { ThreadRepository } from '../repositories/thread.repository.interface';

export class ThreadService {
	constructor(private readonly threads: ThreadRepository) {}

	async findAll(page: number, limit: number, topicId?: string) {
		return this.threads.findAll(page, limit, topicId);
	}

	async findById(id: string) {
		const thread = await this.threads.findById(id);
		if (!thread) throw new NotFoundException('Thread not found');
		return thread;
	}

	async create(userId: string, dto: CreateThreadDto) {
		const id = await this.threads.create(userId, dto);
		return this.findById(id);
	}

	async patch(
		threadId: string,
		userId: string,
		userRole: string,
		dto: PatchThreadDto,
	) {
		const originalPosterId = await this.threads.getOriginalPosterId(threadId);
		if (!originalPosterId) throw new NotFoundException('Thread not found');
		if (
			originalPosterId !== userId &&
			userRole !== 'admin' &&
			userRole !== 'moderator'
		) {
			throw new ForbiddenException();
		}
		await this.threads.update(threadId, dto);
		return this.findById(threadId);
	}

	async delete(threadId: string, userId: string, userRole: string) {
		const originalPosterId = await this.threads.getOriginalPosterId(threadId);
		if (!originalPosterId) throw new NotFoundException('Thread not found');
		if (
			originalPosterId !== userId &&
			userRole !== 'admin' &&
			userRole !== 'moderator'
		) {
			throw new ForbiddenException();
		}
		await this.threads.delete(threadId);
		return { message: 'Thread deleted' };
	}
}
