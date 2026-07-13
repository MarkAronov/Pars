import { LocalStorageProvider } from './providers/local.storage.provider';
import { S3StorageProvider } from './providers/s3.storage.provider';
import type { StorageProvider } from './storage.interface';

// Mirrors backend-nestjs/src/storage/storage.service.ts's STORAGE_DRIVER
// switch — the same precedent DATABASE_DRIVER follows.
export const createStorageProvider = (): StorageProvider => {
	const driver = process.env.STORAGE_DRIVER ?? 's3';
	return driver === 'local'
		? new LocalStorageProvider()
		: new S3StorageProvider();
};
