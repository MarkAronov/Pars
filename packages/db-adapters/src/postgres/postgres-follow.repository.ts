import { and, eq } from 'drizzle-orm';
import type { FollowRepository } from '../repositories/follow.repository.interface';
import { follows, users } from '../schema';
import type { PublicUser } from '../types';
import type { DrizzleDB } from './db';
import { publicUserSelect, toPublicUser } from './public-user.select';

export class PostgresFollowRepository implements FollowRepository {
	constructor(private readonly drizzle: { db: DrizzleDB }) {}

	private get db() {
		return this.drizzle.db;
	}

	async userExists(userId: string): Promise<boolean> {
		const [row] = await this.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		return !!row;
	}

	async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
		const [row] = await this.db
			.select({ followerId: follows.followerId })
			.from(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followeeId, followeeId),
				),
			)
			.limit(1);
		return !!row;
	}

	async follow(followerId: string, followeeId: string): Promise<void> {
		await this.db.insert(follows).values({ followerId, followeeId });
	}

	async unfollow(followerId: string, followeeId: string): Promise<void> {
		await this.db
			.delete(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followeeId, followeeId),
				),
			);
	}

	async getFollowers(
		userId: string,
		page: number,
		limit: number,
	): Promise<PublicUser[]> {
		const rows = await this.db
			.select(publicUserSelect())
			.from(users)
			.innerJoin(follows, eq(follows.followerId, users.id))
			.where(eq(follows.followeeId, userId))
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toPublicUser);
	}

	async getFollowing(
		userId: string,
		page: number,
		limit: number,
	): Promise<PublicUser[]> {
		const rows = await this.db
			.select(publicUserSelect())
			.from(users)
			.innerJoin(follows, eq(follows.followeeId, users.id))
			.where(eq(follows.followerId, userId))
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toPublicUser);
	}
}
