import type { CreatePostDto, PatchPostDto } from '../dto/post.dto';
import type { PublicPost } from '../types';

export interface PostRepository {
	findAll(
		page: number,
		limit: number,
		authorId?: string,
	): Promise<PublicPost[]>;
	findById(id: string): Promise<PublicPost | null>;
	create(authorId: string, dto: CreatePostDto): Promise<string>;
	getAuthorId(postId: string): Promise<string | null>;
	update(postId: string, patch: PatchPostDto): Promise<void>;
	delete(postId: string): Promise<void>;
	isLiked(postId: string, userId: string): Promise<boolean>;
	like(postId: string, userId: string): Promise<void>;
	unlike(postId: string, userId: string): Promise<void>;
	// Postgres-only in practice — see MongoPostRepository's implementation for
	// why (self-hosted MongoDB has no vector search, so it's a documented no-op).
	setEmbedding(postId: string, embedding: number[]): Promise<void>;
}
