import { eq } from 'drizzle-orm';
import type { MediaRepository } from '../repositories/media.repository.interface';
import { media, users } from '../schema';
import type { MediaRecord } from '../types';
import type { DrizzleDB } from './db';

export class PostgresMediaRepository implements MediaRepository {
	constructor(private readonly drizzle: { db: DrizzleDB }) {}

	private get db() {
		return this.drizzle.db;
	}

	async setAvatarUrl(userId: string, url: string): Promise<void> {
		await this.db
			.update(users)
			.set({ avatarUrl: url })
			.where(eq(users.id, userId));
	}

	async setBackgroundUrl(userId: string, url: string): Promise<void> {
		await this.db
			.update(users)
			.set({ backgroundUrl: url })
			.where(eq(users.id, userId));
	}

	async createRecord(record: {
		url: string;
		type: 'AVATAR' | 'BACKGROUND';
		mimeType: string;
		size: number;
		uploaderId: string;
	}): Promise<void> {
		await this.db.insert(media).values(record);
	}

	async findById(mediaId: string): Promise<MediaRecord | null> {
		const [row] = await this.db
			.select()
			.from(media)
			.where(eq(media.id, mediaId));
		return row ?? null;
	}

	async delete(mediaId: string): Promise<void> {
		await this.db.delete(media).where(eq(media.id, mediaId));
	}
}
