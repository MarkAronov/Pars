import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
	constructor(private readonly prisma: PrismaService) {}

	async search(q: string, type: string, page: number, limit: number) {
		const skip = (page - 1) * limit;
		const mode = 'insensitive' as const;

		if (type === 'users') {
			return this.prisma.user.findMany({
				where: { OR: [{ username: { contains: q, mode } }, { displayName: { contains: q, mode } }] },
				skip,
				take: limit,
				select: { id: true, username: true, displayName: true, avatarUrl: true, verified: true },
			});
		}

		if (type === 'topics') {
			return this.prisma.topic.findMany({
				where: { name: { contains: q, mode } },
				skip,
				take: limit,
			});
		}

		// Default: posts
		return this.prisma.post.findMany({
			where: {
				OR: [
					{ title: { contains: q, mode } },
					{ content: { contains: q, mode } },
				],
			},
			skip,
			take: limit,
			select: {
				id: true,
				title: true,
				content: true,
				createdAt: true,
				author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
			},
		});
	}
}
