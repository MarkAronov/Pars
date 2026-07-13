import type { Db } from 'mongodb';
import type { CreateThreadDto, PatchThreadDto } from '../dto/thread.dto';
import type { ThreadRepository } from '../repositories/thread.repository.interface';
import type { PublicThread } from '../types';
import {
	COLLECTIONS,
	type ThreadDoc,
	type TopicDoc,
	type UserDoc,
} from './collections';

type ThreadWithJoins = ThreadDoc & {
	topic: TopicDoc;
	originalPoster: UserDoc;
	postCount: number;
};

function toPublicThread(d: ThreadWithJoins): PublicThread {
	return {
		id: d._id,
		title: d.title,
		createdAt: d.createdAt,
		updatedAt: d.updatedAt,
		topic: { id: d.topic._id, name: d.topic.name },
		originalPoster: {
			id: d.originalPoster._id,
			username: d.originalPoster.username,
			displayName: d.originalPoster.displayName,
			avatarUrl: d.originalPoster.avatarUrl,
		},
		_count: { posts: d.postCount },
	};
}

const threadWithJoinsStages = [
	{
		$lookup: {
			from: COLLECTIONS.topic,
			localField: 'topicId',
			foreignField: '_id',
			as: 'topicArr',
		},
	},
	{ $unwind: '$topicArr' },
	{
		$lookup: {
			from: COLLECTIONS.user,
			localField: 'originalPosterId',
			foreignField: '_id',
			as: 'posterArr',
		},
	},
	{ $unwind: '$posterArr' },
	{
		$lookup: {
			from: COLLECTIONS.post,
			localField: '_id',
			foreignField: 'threadId',
			as: '_postsArr',
		},
	},
	{
		$addFields: {
			topic: '$topicArr',
			originalPoster: '$posterArr',
			postCount: { $size: '$_postsArr' },
		},
	},
	{ $project: { topicArr: 0, posterArr: 0, _postsArr: 0 } },
];

export class MongoThreadRepository implements ThreadRepository {
	constructor(private readonly mongo: { db: Db }) {}

	private get db(): Db {
		return this.mongo.db;
	}

	private get threads() {
		return this.db.collection<ThreadDoc>(COLLECTIONS.thread);
	}

	async findAll(
		page: number,
		limit: number,
		topicId?: string,
	): Promise<PublicThread[]> {
		const docs = await this.threads
			.aggregate<ThreadWithJoins>([
				...(topicId ? [{ $match: { topicId } }] : []),
				{ $sort: { createdAt: -1 } },
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
				...threadWithJoinsStages,
			])
			.toArray();
		return docs.map(toPublicThread);
	}

	async findById(id: string): Promise<PublicThread | null> {
		const [doc] = await this.threads
			.aggregate<ThreadWithJoins>([
				{ $match: { _id: id } },
				...threadWithJoinsStages,
			])
			.toArray();
		return doc ? toPublicThread(doc) : null;
	}

	async create(userId: string, dto: CreateThreadDto): Promise<string> {
		const id = crypto.randomUUID();
		const now = new Date();
		const doc: ThreadDoc = {
			_id: id,
			title: dto.title,
			createdAt: now,
			updatedAt: now,
			topicId: dto.topicId,
			originalPosterId: userId,
		};
		await this.threads.insertOne(doc);
		return id;
	}

	async getOriginalPosterId(threadId: string): Promise<string | null> {
		const doc = await this.threads.findOne(
			{ _id: threadId },
			{ projection: { originalPosterId: 1 } },
		);
		return doc?.originalPosterId ?? null;
	}

	async update(threadId: string, patch: PatchThreadDto): Promise<void> {
		await this.threads.updateOne(
			{ _id: threadId },
			{ $set: { ...patch, updatedAt: new Date() } },
		);
	}

	async delete(threadId: string): Promise<void> {
		// Mirrors Postgres's posts.threadId onDelete:'set null' — posts
		// under the thread survive, just detached from it.
		const session = this.db.client.startSession();
		try {
			await session.withTransaction(async () => {
				await this.db
					.collection(COLLECTIONS.post)
					.updateMany({ threadId }, { $set: { threadId: null } }, { session });
				await this.threads.deleteOne({ _id: threadId }, { session });
			});
		} finally {
			await session.endSession();
		}
	}
}
