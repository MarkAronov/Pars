import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { CreateThreadDto, PatchThreadDto } from './thread.dto';

const THREAD_SELECT = {
	id: true,
	title: true,
	createdAt: true,
	updatedAt: true,
	topic: { select: { id: true, name: true } },
	originalPoster: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
	_count: { select: { posts: true } },
} as const;

@Injectable()
export class ThreadService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(page: number, limit: number, topicId?: string) {
		return this.prisma.thread.findMany({
			where: topicId ? { topicId } : undefined,
			skip: (page - 1) * limit,
			take: limit,
			select: THREAD_SELECT,
			orderBy: { createdAt: 'desc' },
		});
	}

	async findById(id: string) {
		const thread = await this.prisma.thread.findUnique({ where: { id }, select: THREAD_SELECT });
		if (!thread) throw new NotFoundException('Thread not found');
		return thread;
	}

	create(userId: string, dto: CreateThreadDto) {
		return this.prisma.thread.create({
			data: { ...dto, originalPosterId: userId },
			select: THREAD_SELECT,
		});
	}

	async patch(threadId: string, userId: string, userRole: string, dto: PatchThreadDto) {
		const thread = await this.prisma.thread.findUnique({ where: { id: threadId }, select: { originalPosterId: true } });
		if (!thread) throw new NotFoundException('Thread not found');
		if (thread.originalPosterId !== userId && userRole !== 'admin' && userRole !== 'moderator') {
			throw new ForbiddenException();
		}
		return this.prisma.thread.update({ where: { id: threadId }, data: dto, select: THREAD_SELECT });
	}

	async delete(threadId: string, userId: string, userRole: string) {
		const thread = await this.prisma.thread.findUnique({ where: { id: threadId }, select: { originalPosterId: true } });
		if (!thread) throw new NotFoundException('Thread not found');
		if (thread.originalPosterId !== userId && userRole !== 'admin' && userRole !== 'moderator') {
			throw new ForbiddenException();
		}
		await this.prisma.thread.delete({ where: { id: threadId } });
		return { message: 'Thread deleted' };
	}
}
