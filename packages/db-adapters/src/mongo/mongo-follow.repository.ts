import type { Db } from 'mongodb';
import type { FollowRepository } from '../repositories/follow.repository.interface';
import type { PublicUser } from '../types';
import { COLLECTIONS, type FollowDoc, type UserDoc } from './collections';
import {
	toPublicUser,
	type UserWithCounts,
	userAggregationStages,
} from './public-user.select';

export class MongoFollowRepository implements FollowRepository {
	constructor(private readonly mongo: { db: Db }) {}

	private get db(): Db {
		return this.mongo.db;
	}

	private get follows() {
		return this.db.collection<FollowDoc>(COLLECTIONS.follow);
	}

	private get users() {
		return this.db.collection<UserDoc>(COLLECTIONS.user);
	}

	async userExists(userId: string): Promise<boolean> {
		const count = await this.users.countDocuments(
			{ _id: userId },
			{ limit: 1 },
		);
		return count > 0;
	}

	async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
		const count = await this.follows.countDocuments(
			{ followerId, followeeId },
			{ limit: 1 },
		);
		return count > 0;
	}

	async follow(followerId: string, followeeId: string): Promise<void> {
		await this.follows.insertOne({
			followerId,
			followeeId,
			createdAt: new Date(),
		});
	}

	async unfollow(followerId: string, followeeId: string): Promise<void> {
		await this.follows.deleteOne({ followerId, followeeId });
	}

	async getFollowers(
		userId: string,
		page: number,
		limit: number,
	): Promise<PublicUser[]> {
		const followerIds = await this.follows
			.find({ followeeId: userId })
			.project<{ followerId: string }>({ followerId: 1, _id: 0 })
			.skip((page - 1) * limit)
			.limit(limit)
			.toArray();
		const ids = followerIds.map((f) => f.followerId);
		if (ids.length === 0) return [];
		const docs = await this.users
			.aggregate<UserWithCounts>([
				{ $match: { _id: { $in: ids } } },
				...userAggregationStages(),
			])
			.toArray();
		return docs.map(toPublicUser);
	}

	async getFollowing(
		userId: string,
		page: number,
		limit: number,
	): Promise<PublicUser[]> {
		const followeeIds = await this.follows
			.find({ followerId: userId })
			.project<{ followeeId: string }>({ followeeId: 1, _id: 0 })
			.skip((page - 1) * limit)
			.limit(limit)
			.toArray();
		const ids = followeeIds.map((f) => f.followeeId);
		if (ids.length === 0) return [];
		const docs = await this.users
			.aggregate<UserWithCounts>([
				{ $match: { _id: { $in: ids } } },
				...userAggregationStages(),
			])
			.toArray();
		return docs.map(toPublicUser);
	}
}
