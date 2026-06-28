import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { eq } from 'drizzle-orm';
import { fileTypeFromBuffer } from 'file-type';
import type { DrizzleService } from '../../database/drizzle.service';
import { media, users } from '../../database/schema';

const ALLOWED_IMAGE_MIMES = new Set([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
]);
const MEDIA_ROOT = path.resolve(process.cwd(), 'media');

@Injectable()
export class MediaService {
	constructor(private readonly drizzle: DrizzleService) {}

	async validateImageMime(buffer: Buffer): Promise<string> {
		const type = await fileTypeFromBuffer(buffer);
		if (!type || !ALLOWED_IMAGE_MIMES.has(type.mime)) {
			throw new BadRequestException('Invalid image type');
		}
		return type.mime;
	}

	async saveFile(
		buffer: Buffer,
		filename: string,
		subdir: string,
	): Promise<string> {
		const dir = path.join(MEDIA_ROOT, subdir);
		await fs.mkdir(dir, { recursive: true });
		const dest = path.join(dir, filename);
		await fs.writeFile(dest, buffer);
		return `/media/${subdir}/${filename}`;
	}

	async uploadAvatar(
		uploaderId: string,
		file: Express.Multer.File,
	): Promise<{ url: string }> {
		const mimeType = await this.validateImageMime(file.buffer);
		const ext = mimeType.split('/')[1];
		const filename = `${uploaderId}-${Date.now()}.${ext}`;
		const url = await this.saveFile(file.buffer, filename, 'avatar');

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
		const filename = `${uploaderId}-${Date.now()}.${ext}`;
		const url = await this.saveFile(file.buffer, filename, 'backgroundImage');

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

		const filePath = path.join(
			MEDIA_ROOT,
			mediaRecord.url.replace('/media/', ''),
		);
		await fs.unlink(filePath).catch(() => null);
		await this.drizzle.db.delete(media).where(eq(media.id, mediaId));
		return { message: 'Media deleted' };
	}
}
