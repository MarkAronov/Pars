import type { Db } from 'mongodb';
import type { CreateTopicDto, PatchTopicDto } from '../dto/topic.dto';
import type { TopicRepository } from '../repositories/topic.repository.interface';
import type { PublicTopic } from '../types';
import { COLLECTIONS, type TopicDoc } from './collections';

function toPublicTopic(doc: TopicDoc): PublicTopic {
	return { id: doc._id, name: doc.name, description: doc.description };
}

export class MongoTopicRepository implements TopicRepository {
	constructor(private readonly mongo: { db: Db }) {}

	private get db(): Db {
		return this.mongo.db;
	}

	private get collection() {
		return this.db.collection<TopicDoc>(COLLECTIONS.topic);
	}

	async findAll(page: number, limit: number): Promise<PublicTopic[]> {
		const docs = await this.collection
			.find()
			.sort({ name: 1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.toArray();
		return docs.map(toPublicTopic);
	}

	async findById(id: string): Promise<PublicTopic | null> {
		const doc = await this.collection.findOne({ _id: id });
		return doc ? toPublicTopic(doc) : null;
	}

	async create(dto: CreateTopicDto): Promise<PublicTopic> {
		const doc: TopicDoc = {
			_id: crypto.randomUUID(),
			name: dto.name,
			description: dto.description ?? null,
		};
		await this.collection.insertOne(doc);
		return toPublicTopic(doc);
	}

	async update(id: string, dto: PatchTopicDto): Promise<PublicTopic> {
		const result = await this.collection.findOneAndUpdate(
			{ _id: id },
			{ $set: dto },
			{ returnDocument: 'after' },
		);
		if (!result) throw new Error('Topic not found');
		return toPublicTopic(result);
	}

	async delete(id: string): Promise<void> {
		// Postgres cascades topic deletion to its threads (onDelete: 'cascade'
		// on thread.topicId), while posts under those threads only get
		// threadId set to null (thread.id has onDelete: 'set null' from
		// posts) — never deleted themselves. Mirrored here in one transaction
		// since it spans two collections.
		const session = this.db.client.startSession();
		try {
			await session.withTransaction(async () => {
				const threadIds = await this.db
					.collection(COLLECTIONS.thread)
					.find({ topicId: id }, { session, projection: { _id: 1 } })
					.toArray();
				const ids = threadIds.map((t) => t._id);
				if (ids.length > 0) {
					await this.db
						.collection(COLLECTIONS.post)
						.updateMany(
							{ threadId: { $in: ids } },
							{ $set: { threadId: null } },
							{ session },
						);
					await this.db
						.collection(COLLECTIONS.thread)
						.deleteMany({ topicId: id }, { session });
				}
				await this.collection.deleteOne({ _id: id }, { session });
			});
		} finally {
			await session.endSession();
		}
	}
}
