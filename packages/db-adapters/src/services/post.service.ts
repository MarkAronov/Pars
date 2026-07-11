import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { CreatePostDto, PatchPostDto } from '../dto/post.dto';
import type { PostRepository } from '../repositories/post.repository.interface';

export class PostService {
	constructor(private readonly posts: PostRepository) {}

	async findAll(page: number, limit: number, authorId?: string) {
		return this.posts.findAll(page, limit, authorId);
	}

	async findById(id: string) {
		const post = await this.posts.findById(id);
		if (!post) throw new NotFoundException('Post not found');
		return post;
	}

	async create(authorId: string, dto: CreatePostDto) {
		const id = await this.posts.create(authorId, dto);
		return this.findById(id);
	}

	async patch(
		postId: string,
		userId: string,
		userRole: string,
		dto: PatchPostDto,
	) {
		const authorId = await this.posts.getAuthorId(postId);
		if (!authorId) throw new NotFoundException('Post not found');
		if (authorId !== userId && userRole !== 'admin') {
			throw new ForbiddenException();
		}
		await this.posts.update(postId, dto);
		return this.findById(postId);
	}

	async delete(postId: string, userId: string, userRole: string) {
		const authorId = await this.posts.getAuthorId(postId);
		if (!authorId) throw new NotFoundException('Post not found');
		if (authorId !== userId && userRole !== 'admin') {
			throw new ForbiddenException();
		}
		await this.posts.delete(postId);
		return { message: 'Post deleted' };
	}

	async toggleLike(postId: string, userId: string) {
		const liked = await this.posts.isLiked(postId, userId);
		if (liked) {
			await this.posts.unlike(postId, userId);
			return { liked: false };
		}
		await this.posts.like(postId, userId);
		return { liked: true };
	}
}
