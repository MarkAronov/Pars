import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { CreatePostDto, PatchPostDto } from './post.dto';

const POST_SELECT = {
	id: true,
	title: true,
	content: true,
	edited: true,
	createdAt: true,
	updatedAt: true,
	author: {
		select: { id: true, username: true, displayName: true, avatarUrl: true, verified: true },
	},
	_count: { select: { likes: true, mentionedBy: true } },
	threadId: true,
} as const;

@Injectable()
export class PostService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(page: number, limit: number) {
		const skip = (page - 1) * limit;
		return this.prisma.post.findMany({ skip, take: limit, select: POST_SELECT, orderBy: { createdAt: 'desc' } });
	}

	async findById(id: string) {
		const post = await this.prisma.post.findUnique({ where: { id }, select: POST_SELECT });
		if (!post) throw new NotFoundException('Post not found');
		return post;
	}

	create(authorId: string, dto: CreatePostDto) {
		return this.prisma.post.create({ data: { ...dto, authorId }, select: POST_SELECT });
	}

	async patch(postId: string, userId: string, userRole: string, dto: PatchPostDto) {
		const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
		if (!post) throw new NotFoundException('Post not found');
		if (post.authorId !== userId && userRole !== 'admin') throw new ForbiddenException();
		return this.prisma.post.update({ where: { id: postId }, data: { ...dto, edited: true }, select: POST_SELECT });
	}

	async delete(postId: string, userId: string, userRole: string) {
		const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
		if (!post) throw new NotFoundException('Post not found');
		if (post.authorId !== userId && userRole !== 'admin') throw new ForbiddenException();
		await this.prisma.post.delete({ where: { id: postId } });
		return { message: 'Post deleted' };
	}

	async toggleLike(postId: string, userId: string) {
		const existing = await this.prisma.postLike.findUnique({
			where: { postId_userId: { postId, userId } },
		});
		if (existing) {
			await this.prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
			return { liked: false };
		}
		await this.prisma.postLike.create({ data: { postId, userId } });
		return { liked: true };
	}
}
