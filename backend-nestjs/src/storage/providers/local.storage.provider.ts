import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { StorageProvider } from '../storage.interface';

export class LocalStorageProvider implements StorageProvider {
	private readonly baseDir = resolve(process.cwd(), 'media');
	private readonly publicUrl =
		process.env.PUBLIC_URL ?? 'http://localhost:3000';

	async upload(
		buffer: Buffer,
		key: string,
		_mimeType: string,
	): Promise<string> {
		const dest = join(this.baseDir, key);
		await mkdir(dirname(dest), { recursive: true });
		await writeFile(dest, buffer);
		return `${this.publicUrl}/media/${key}`;
	}

	async delete(key: string): Promise<void> {
		await unlink(join(this.baseDir, key)).catch(() => null);
	}

	keyFromUrl(url: string): string {
		const marker = '/media/';
		return url.slice(url.indexOf(marker) + marker.length);
	}
}
