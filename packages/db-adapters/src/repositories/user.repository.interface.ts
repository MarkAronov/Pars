import type { PublicUser } from '../types';

export interface UserRepository {
	findAll(page: number, limit: number): Promise<PublicUser[]>;
	findById(id: string): Promise<PublicUser | null>;
	findByIdOrUsername(idOrUsername: string): Promise<PublicUser | null>;
	updateRegular(
		userId: string,
		patch: { displayName?: string; bio?: string },
	): Promise<void>;
	updateImportant(
		userId: string,
		patch: { username?: string; email?: string },
	): Promise<void>;
	delete(userId: string): Promise<void>;
	getCredentialAccount(
		userId: string,
	): Promise<{ accountId: string; passwordHash: string } | null>;
	updateAccountPassword(accountId: string, passwordHash: string): Promise<void>;
}
