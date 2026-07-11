import { and, eq, or } from 'drizzle-orm';
import type { UserRepository } from '../repositories/user.repository.interface';
import { accounts, users } from '../schema';
import type { PublicUser } from '../types';
import type { DrizzleDB } from './db';
import { publicUserSelect, toPublicUser } from './public-user.select';

export class PostgresUserRepository implements UserRepository {
	constructor(private readonly drizzle: { db: DrizzleDB }) {}

	private get db() {
		return this.drizzle.db;
	}

	async findAll(page: number, limit: number): Promise<PublicUser[]> {
		const rows = await this.db
			.select(publicUserSelect())
			.from(users)
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toPublicUser);
	}

	async findById(id: string): Promise<PublicUser | null> {
		const [row] = await this.db
			.select(publicUserSelect())
			.from(users)
			.where(eq(users.id, id));
		return row ? toPublicUser(row) : null;
	}

	async findByIdOrUsername(idOrUsername: string): Promise<PublicUser | null> {
		const [row] = await this.db
			.select(publicUserSelect())
			.from(users)
			.where(or(eq(users.id, idOrUsername), eq(users.username, idOrUsername)))
			.limit(1);
		return row ? toPublicUser(row) : null;
	}

	async updateRegular(
		userId: string,
		patch: { displayName?: string; bio?: string },
	): Promise<void> {
		await this.db.update(users).set(patch).where(eq(users.id, userId));
	}

	async updateImportant(
		userId: string,
		patch: { username?: string; email?: string },
	): Promise<void> {
		await this.db.update(users).set(patch).where(eq(users.id, userId));
	}

	async delete(userId: string): Promise<void> {
		await this.db.delete(users).where(eq(users.id, userId));
	}

	async getCredentialAccount(
		userId: string,
	): Promise<{ accountId: string; passwordHash: string } | null> {
		const [account] = await this.db
			.select({ id: accounts.id, password: accounts.password })
			.from(accounts)
			.where(
				and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')),
			)
			.limit(1);
		if (!account?.password) return null;
		return { accountId: account.id, passwordHash: account.password };
	}

	async updateAccountPassword(
		accountId: string,
		passwordHash: string,
	): Promise<void> {
		await this.db
			.update(accounts)
			.set({ password: passwordHash })
			.where(eq(accounts.id, accountId));
	}
}
