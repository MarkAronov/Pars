import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FeedService {
	constructor(private readonly prisma: PrismaService) {}

	async getForUser(userId: string, page: number, limit: number) {
		const skip = (page - 1) * limit;

		const following = await this.prisma.follow.findMany({
			where: { followerId: userId },
			select: { followeeId: true },
		});
		const authorIds = [
			userId,
			...following.map((f: { followeeId: string }) => f.followeeId),
		];

		const [posts, total] = await this.prisma.$transaction([
			this.prisma.post.findMany({
				where: { authorId: { in: authorIds } },
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					title: true,
					content: true,
					createdAt: true,
					author: {
						select: {
							id: true,
							username: true,
							displayName: true,
							avatarUrl: true,
							verified: true,
						},
					},
					_count: { select: { likes: true } },
				},
			}),
			this.prisma.post.count({ where: { authorId: { in: authorIds } } }),
		]);

		return { posts, total, page, limit };
	}
}
