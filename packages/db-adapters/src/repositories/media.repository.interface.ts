import type { MediaRecord } from '../types';

export interface MediaRepository {
	setAvatarUrl(userId: string, url: string): Promise<void>;
	setBackgroundUrl(userId: string, url: string): Promise<void>;
	createRecord(record: {
		url: string;
		type: 'AVATAR' | 'BACKGROUND';
		mimeType: string;
		size: number;
		uploaderId: string;
	}): Promise<void>;
	findById(mediaId: string): Promise<MediaRecord | null>;
	delete(mediaId: string): Promise<void>;
}
