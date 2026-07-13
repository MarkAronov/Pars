import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import type { StorageProvider } from '../storage.interface';

export class S3StorageProvider implements StorageProvider {
	private readonly s3: S3Client;
	private readonly bucket: string;
	private readonly publicBase: string;

	constructor() {
		this.bucket = process.env.BUCKET_NAME ?? 'pars-media';
		// Generic name — works with any S3-compatible provider (Tigris, Cloudflare
		// R2, Backblaze B2, ...), not just the Tigris default this falls back to.
		this.publicBase =
			process.env.S3_PUBLIC_URL ??
			`https://${this.bucket}.fly.storage.tigris.dev`;
		this.s3 = new S3Client({
			region: process.env.AWS_REGION ?? 'auto',
			endpoint:
				process.env.AWS_ENDPOINT_URL_S3 ?? 'https://fly.storage.tigris.dev',
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
			},
		});
	}

	async upload(buffer: Buffer, key: string, mimeType: string): Promise<string> {
		await this.s3.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: buffer,
				ContentType: mimeType,
				ACL: 'public-read',
			}),
		);
		return `${this.publicBase}/${key}`;
	}

	async delete(key: string): Promise<void> {
		await this.s3.send(
			new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
		);
	}

	keyFromUrl(url: string): string {
		return url.replace(`${this.publicBase}/`, '');
	}
}
