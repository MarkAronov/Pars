import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { CreatePostDto, PatchPostDto } from '../dto/post.dto';
import type { PostRepository } from '../repositories/post.repository.interface';
import { embedText } from '../search/embeddings';

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
		await this.generateEmbedding(id, dto.content);
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
		if (dto.content) await this.generateEmbedding(postId, dto.content);
		return this.findById(postId);
	}

	// A no-op when OPENAI_API_KEY isn't configured (embedText returns null) —
	// see embeddings.ts. Never fails post creation/editing: embedding
	// generation is a secondary enhancement for semantic search, not core
	// functionality, so a transient API error here shouldn't 500 the request.
	private async generateEmbedding(postId: string, content: string) {
		try {
			const embedding = await embedText(content);
			if (embedding) await this.posts.setEmbedding(postId, embedding);
		} catch (err) {
			console.error('Failed to generate post embedding', err);
		}
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
