import type { Db } from 'mongodb';
import type { MediaRepository } from '../repositories/media.repository.interface';
import type { MediaRecord } from '../types';
import { COLLECTIONS, type MediaDoc, type UserDoc } from './collections';

function toMediaRecord(doc: MediaDoc): MediaRecord {
	return {
		id: doc._id,
		url: doc.url,
		type: doc.type,
		mimeType: doc.mimeType,
		size: doc.size,
		uploaderId: doc.uploaderId,
		postId: doc.postId,
	};
}

export class MongoMediaRepository implements MediaRepository {
	constructor(private readonly mongo: { db: Db }) {}

	private get db(): Db {
		return this.mongo.db;
	}

	private get media() {
		return this.db.collection<MediaDoc>(COLLECTIONS.media);
	}

	async setAvatarUrl(userId: string, url: string): Promise<void> {
		await this.db
			.collection<UserDoc>(COLLECTIONS.user)
			.updateOne({ _id: userId }, { $set: { avatarUrl: url } });
	}

	async setBackgroundUrl(userId: string, url: string): Promise<void> {
		await this.db
			.collection<UserDoc>(COLLECTIONS.user)
			.updateOne({ _id: userId }, { $set: { backgroundUrl: url } });
	}

	async createRecord(record: {
		url: string;
		type: 'AVATAR' | 'BACKGROUND';
		mimeType: string;
		size: number;
		uploaderId: string;
	}): Promise<void> {
		const doc: MediaDoc = {
			_id: crypto.randomUUID(),
			url: record.url,
			type: record.type,
			mimeType: record.mimeType,
			size: record.size,
			createdAt: new Date(),
			uploaderId: record.uploaderId,
			postId: null,
		};
		await this.media.insertOne(doc);
	}

	async findById(mediaId: string): Promise<MediaRecord | null> {
		const doc = await this.media.findOne({ _id: mediaId });
		return doc ? toMediaRecord(doc) : null;
	}

	async delete(mediaId: string): Promise<void> {
		await this.media.deleteOne({ _id: mediaId });
	}
}
