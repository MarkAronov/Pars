export interface MediaStorage {
	upload(buffer: Buffer, key: string, mimeType: string): Promise<string>;
	delete(key: string): Promise<void>;
	keyFromUrl(url: string): string;
}
