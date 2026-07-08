import { Injectable, type OnModuleInit } from '@nestjs/common';
import { LocalStorageProvider } from './providers/local.storage.provider';
import { S3StorageProvider } from './providers/s3.storage.provider';
import type { StorageProvider } from './storage.interface';

@Injectable()
export class StorageService implements OnModuleInit {
	private provider!: StorageProvider;

	onModuleInit() {
		const driver = process.env.STORAGE_DRIVER ?? 's3';
		this.provider =
			driver === 'local' ? new LocalStorageProvider() : new S3StorageProvider();
	}

	upload(buffer: Buffer, key: string, mimeType: string): Promise<string> {
		return this.provider.upload(buffer, key, mimeType);
	}

	delete(key: string): Promise<void> {
		return this.provider.delete(key);
	}

	keyFromUrl(url: string): string {
		return this.provider.keyFromUrl(url);
	}
}
