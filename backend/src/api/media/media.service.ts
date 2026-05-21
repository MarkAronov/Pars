import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import type { PrismaService } from '../../database/prisma.service';

const ALLOWED_IMAGE_MIMES = new Set([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
]);
const MEDIA_ROOT = path.resolve(process.cwd(), 'media');

@Injectable()
export class MediaService {
	constructor(private readonly prisma: PrismaService) {}

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

		await this.prisma.user.update({
			where: { id: uploaderId },
			data: { avatarUrl: url },
		});
		await this.prisma.media.create({
			data: { url, type: 'AVATAR', mimeType, size: file.size, uploaderId },
		});
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

		await this.prisma.user.update({
			where: { id: uploaderId },
			data: { backgroundUrl: url },
		});
		await this.prisma.media.create({
			data: { url, type: 'BACKGROUND', mimeType, size: file.size, uploaderId },
		});
		return { url };
	}

	async deleteMedia(
		mediaId: string,
		requesterId: string,
	): Promise<{ message: string }> {
		const media = await this.prisma.media.findUniqueOrThrow({
			where: { id: mediaId },
		});
		const filePath = path.join(MEDIA_ROOT, media.url.replace('/media/', ''));
		await fs.unlink(filePath).catch(() => null);
		await this.prisma.media.delete({ where: { id: mediaId } });
		return { message: 'Media deleted' };
	}
}
