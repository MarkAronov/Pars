import type { Db } from 'mongodb';
import type { SearchRepository } from '../repositories/search.repository.interface';
import type { PublicTopic, SearchPostResult, SearchUserResult } from '../types';
import {
	COLLECTIONS,
	type PostDoc,
	type TopicDoc,
	type UserDoc,
} from './collections';

// Postgres uses `ilike` (case-insensitive substring); a case-insensitive
// regex is the direct Mongo equivalent. `q` is escaped since it's user input
// interpolated into a regex pattern.
function escapeRegex(q: string): string {
	return q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MongoSearchRepository implements SearchRepository {
	constructor(private readonly mongo: { db: Db }) {}

	private get db(): Db {
		return this.mongo.db;
	}

	async searchUsers(
		q: string,
		page: number,
		limit: number,
	): Promise<SearchUserResult[]> {
		const pattern = new RegExp(escapeRegex(q), 'i');
		const docs = await this.db
			.collection<UserDoc>(COLLECTIONS.user)
			.find({ $or: [{ username: pattern }, { displayName: pattern }] })
			.skip((page - 1) * limit)
			.limit(limit)
			.toArray();
		return docs.map((d) => ({
			id: d._id,
			username: d.username,
			displayName: d.displayName,
			avatarUrl: d.avatarUrl,
			verified: d.verified,
		}));
	}

	async searchTopics(
		q: string,
		page: number,
		limit: number,
	): Promise<PublicTopic[]> {
		const pattern = new RegExp(escapeRegex(q), 'i');
		const docs = await this.db
			.collection<TopicDoc>(COLLECTIONS.topic)
			.find({ name: pattern })
			.skip((page - 1) * limit)
			.limit(limit)
			.toArray();
		return docs.map((d) => ({
			id: d._id,
			name: d.name,
			description: d.description,
		}));
	}

	async searchPosts(
		q: string,
		page: number,
		limit: number,
	): Promise<SearchPostResult[]> {
		const pattern = new RegExp(escapeRegex(q), 'i');
		const docs = await this.db
			.collection<PostDoc>(COLLECTIONS.post)
			.aggregate<
				PostDoc & {
					author: UserDoc;
				}
			>([
				{ $match: { $or: [{ title: pattern }, { content: pattern }] } },
				{
					$lookup: {
						from: COLLECTIONS.user,
						localField: 'authorId',
						foreignField: '_id',
						as: 'authorArr',
					},
				},
				{ $unwind: '$authorArr' },
				{ $addFields: { author: '$authorArr' } },
				{ $project: { authorArr: 0 } },
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
			])
			.toArray();

		return docs.map((d) => ({
			id: d._id,
			title: d.title,
			content: d.content,
			createdAt: d.createdAt,
			author: {
				id: d.author._id,
				username: d.author.username,
				displayName: d.author.displayName,
				avatarUrl: d.author.avatarUrl,
			},
		}));
	}
}
