export interface StorageProvider {
	upload(buffer: Buffer, key: string, mimeType: string): Promise<string>;
	delete(key: string): Promise<void>;
	keyFromUrl(url: string): string;
}
