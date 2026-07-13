import type { Db } from 'mongodb';
import type { CreatePostDto, PatchPostDto } from '../dto/post.dto';
import type { PostRepository } from '../repositories/post.repository.interface';
import type { PublicPost } from '../types';
import {
	COLLECTIONS,
	type PostDoc,
	type PostLikeDoc,
	type UserDoc,
} from './collections';

type PostWithCounts = PostDoc & {
	author: UserDoc;
	likeCount: number;
	mentionedByCount: number;
};

function toPublicPost(d: PostWithCounts): PublicPost {
	return {
		id: d._id,
		title: d.title,
		content: d.content,
		edited: d.edited,
		createdAt: d.createdAt,
		updatedAt: d.updatedAt,
		threadId: d.threadId,
		author: {
			id: d.author._id,
			username: d.author.username,
			displayName: d.author.displayName,
			avatarUrl: d.author.avatarUrl,
			verified: d.author.verified,
		},
		_count: { likes: d.likeCount, mentionedBy: d.mentionedByCount },
	};
}

const postWithCountsStages = [
	{
		$lookup: {
			from: COLLECTIONS.user,
			localField: 'authorId',
			foreignField: '_id',
			as: 'authorArr',
		},
	},
	{ $unwind: '$authorArr' },
	{
		$lookup: {
			from: COLLECTIONS.postLike,
			localField: '_id',
			foreignField: 'postId',
			as: '_likesArr',
		},
	},
	{
		$lookup: {
			from: COLLECTIONS.postMention,
			localField: '_id',
			foreignField: 'mentionedPostId',
			as: '_mentionsArr',
		},
	},
	{
		$addFields: {
			author: '$authorArr',
			likeCount: { $size: '$_likesArr' },
			mentionedByCount: { $size: '$_mentionsArr' },
		},
	},
	{ $project: { authorArr: 0, _likesArr: 0, _mentionsArr: 0 } },
];

export class MongoPostRepository implements PostRepository {
	constructor(private readonly mongo: { db: Db }) {}

	private get db(): Db {
		return this.mongo.db;
	}

	private get posts() {
		return this.db.collection<PostDoc>(COLLECTIONS.post);
	}

	async findAll(
		page: number,
		limit: number,
		authorId?: string,
	): Promise<PublicPost[]> {
		const docs = await this.posts
			.aggregate<PostWithCounts>([
				...(authorId ? [{ $match: { authorId } }] : []),
				{ $sort: { createdAt: -1 } },
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
				...postWithCountsStages,
			])
			.toArray();
		return docs.map(toPublicPost);
	}

	async findById(id: string): Promise<PublicPost | null> {
		const [doc] = await this.posts
			.aggregate<PostWithCounts>([
				{ $match: { _id: id } },
				...postWithCountsStages,
			])
			.toArray();
		return doc ? toPublicPost(doc) : null;
	}

	async create(authorId: string, dto: CreatePostDto): Promise<string> {
		const id = crypto.randomUUID();
		const now = new Date();
		const doc: PostDoc = {
			_id: id,
			title: dto.title ?? null,
			content: dto.content,
			edited: false,
			createdAt: now,
			updatedAt: now,
			embedding: null,
			authorId,
			threadId: dto.threadId ?? null,
		};
		await this.posts.insertOne(doc);
		return id;
	}

	async getAuthorId(postId: string): Promise<string | null> {
		const doc = await this.posts.findOne(
			{ _id: postId },
			{ projection: { authorId: 1 } },
		);
		return doc?.authorId ?? null;
	}

	async update(postId: string, patch: PatchPostDto): Promise<void> {
		await this.posts.updateOne(
			{ _id: postId },
			{ $set: { ...patch, edited: true, updatedAt: new Date() } },
		);
	}

	async delete(postId: string): Promise<void> {
		// Mirrors Postgres's post_like/post_mention onDelete:'cascade' and
		// media.postId onDelete:'set null' — spans four collections, so it
		// needs a transaction for atomicity (requires the replica-set-backed
		// Mongo instance database-mongodb/ provisions).
		const session = this.db.client.startSession();
		try {
			await session.withTransaction(async () => {
				await this.db
					.collection(COLLECTIONS.postLike)
					.deleteMany({ postId }, { session });
				await this.db
					.collection(COLLECTIONS.postMention)
					.deleteMany(
						{ $or: [{ mentionerPostId: postId }, { mentionedPostId: postId }] },
						{ session },
					);
				await this.db
					.collection(COLLECTIONS.media)
					.updateMany({ postId }, { $set: { postId: null } }, { session });
				await this.posts.deleteOne({ _id: postId }, { session });
			});
		} finally {
			await session.endSession();
		}
	}

	async isLiked(postId: string, userId: string): Promise<boolean> {
		const count = await this.db
			.collection<PostLikeDoc>(COLLECTIONS.postLike)
			.countDocuments({ postId, userId }, { limit: 1 });
		return count > 0;
	}

	async like(postId: string, userId: string): Promise<void> {
		await this.db
			.collection<PostLikeDoc>(COLLECTIONS.postLike)
			.insertOne({ postId, userId, createdAt: new Date() });
	}

	async unlike(postId: string, userId: string): Promise<void> {
		await this.db
			.collection<PostLikeDoc>(COLLECTIONS.postLike)
			.deleteOne({ postId, userId });
	}

	// Documented no-op: self-hosted MongoDB has no native vector search (see
	// the plan's Mongo/semantic-search asymmetry note), so nothing ever reads
	// this back — storing it anyway would just be dead weight.
	async setEmbedding(_postId: string, _embedding: number[]): Promise<void> {}
}
