import { BadRequestException, NotFoundException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import type { MediaRepository } from '../repositories/media.repository.interface';
import type { MediaStorage } from '../repositories/media-storage.interface';

const ALLOWED_IMAGE_MIMES = new Set([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
]);

export class MediaService {
	constructor(
		private readonly media: MediaRepository,
		private readonly storage: MediaStorage,
	) {}

	private async validateImageMime(buffer: Buffer): Promise<string> {
		const type = await fileTypeFromBuffer(buffer);
		if (!type || !ALLOWED_IMAGE_MIMES.has(type.mime)) {
			throw new BadRequestException('Invalid image type');
		}
		return type.mime;
	}

	async uploadAvatar(
		uploaderId: string,
		file: { buffer: Buffer; size: number },
	): Promise<{ url: string }> {
		const mimeType = await this.validateImageMime(file.buffer);
		const ext = mimeType.split('/')[1];
		const key = `avatar/${uploaderId}-${Date.now()}.${ext}`;
		const url = await this.storage.upload(file.buffer, key, mimeType);

		await this.media.setAvatarUrl(uploaderId, url);
		await this.media.createRecord({
			url,
			type: 'AVATAR',
			mimeType,
			size: file.size,
			uploaderId,
		});
		return { url };
	}

	async uploadBackground(
		uploaderId: string,
		file: { buffer: Buffer; size: number },
	): Promise<{ url: string }> {
		const mimeType = await this.validateImageMime(file.buffer);
		const ext = mimeType.split('/')[1];
		const key = `backgroundImage/${uploaderId}-${Date.now()}.${ext}`;
		const url = await this.storage.upload(file.buffer, key, mimeType);

		await this.media.setBackgroundUrl(uploaderId, url);
		await this.media.createRecord({
			url,
			type: 'BACKGROUND',
			mimeType,
			size: file.size,
			uploaderId,
		});
		return { url };
	}

	async deleteMedia(mediaId: string): Promise<{ message: string }> {
		const record = await this.media.findById(mediaId);
		if (!record) throw new NotFoundException('Media not found');

		const key = this.storage.keyFromUrl(record.url);
		await this.storage.delete(key);
		await this.media.delete(mediaId);
		return { message: 'Media deleted' };
	}
}
