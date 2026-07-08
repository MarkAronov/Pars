import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { fileTypeFromBuffer } from 'file-type';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { DrizzleService } from '../../database/drizzle.service';
import { media, users } from '../../database/schema';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { StorageService } from '../../storage/storage.service';

const ALLOWED_IMAGE_MIMES = new Set([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
]);

@Injectable()
export class MediaService {
	constructor(
		private readonly drizzle: DrizzleService,
		private readonly storage: StorageService,
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
		file: Express.Multer.File,
	): Promise<{ url: string }> {
		const mimeType = await this.validateImageMime(file.buffer);
		const ext = mimeType.split('/')[1];
		const key = `avatar/${uploaderId}-${Date.now()}.${ext}`;
		const url = await this.storage.upload(file.buffer, key, mimeType);

		await this.drizzle.db
			.update(users)
			.set({ avatarUrl: url })
			.where(eq(users.id, uploaderId));
		await this.drizzle.db
			.insert(media)
			.values({ url, type: 'AVATAR', mimeType, size: file.size, uploaderId });
		return { url };
	}

	async uploadBackground(
		uploaderId: string,
		file: Express.Multer.File,
	): Promise<{ url: string }> {
		const mimeType = await this.validateImageMime(file.buffer);
		const ext = mimeType.split('/')[1];
		const key = `backgroundImage/${uploaderId}-${Date.now()}.${ext}`;
		const url = await this.storage.upload(file.buffer, key, mimeType);

		await this.drizzle.db
			.update(users)
			.set({ backgroundUrl: url })
			.where(eq(users.id, uploaderId));
		await this.drizzle.db.insert(media).values({
			url,
			type: 'BACKGROUND',
			mimeType,
			size: file.size,
			uploaderId,
		});
		return { url };
	}

	async deleteMedia(
		mediaId: string,
		_requesterId: string,
	): Promise<{ message: string }> {
		const [mediaRecord] = await this.drizzle.db
			.select()
			.from(media)
			.where(eq(media.id, mediaId));
		if (!mediaRecord) throw new NotFoundException('Media not found');

		const key = this.storage.keyFromUrl(mediaRecord.url);
		await this.storage.delete(key);
		await this.drizzle.db.delete(media).where(eq(media.id, mediaId));
		return { message: 'Media deleted' };
	}
}
