import type { Db } from 'mongodb';
import type { UserRepository } from '../repositories/user.repository.interface';
import type { PublicUser } from '../types';
import { type AccountDoc, COLLECTIONS, type UserDoc } from './collections';
import {
	toPublicUser,
	type UserWithCounts,
	userAggregationStages,
} from './public-user.select';

export class MongoUserRepository implements UserRepository {
	constructor(private readonly mongo: { db: Db }) {}

	private get db(): Db {
		return this.mongo.db;
	}

	private get users() {
		return this.db.collection<UserDoc>(COLLECTIONS.user);
	}

	async findAll(page: number, limit: number): Promise<PublicUser[]> {
		const docs = await this.users
			.aggregate<UserWithCounts>([
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
				...userAggregationStages(),
			])
			.toArray();
		return docs.map(toPublicUser);
	}

	async findById(id: string): Promise<PublicUser | null> {
		const [doc] = await this.users
			.aggregate<UserWithCounts>([
				{ $match: { _id: id } },
				...userAggregationStages(),
			])
			.toArray();
		return doc ? toPublicUser(doc) : null;
	}

	async findByIdOrUsername(idOrUsername: string): Promise<PublicUser | null> {
		const [doc] = await this.users
			.aggregate<UserWithCounts>([
				{
					$match: { $or: [{ _id: idOrUsername }, { username: idOrUsername }] },
				},
				...userAggregationStages(),
			])
			.toArray();
		return doc ? toPublicUser(doc) : null;
	}

	async updateRegular(
		userId: string,
		patch: { displayName?: string; bio?: string },
	): Promise<void> {
		await this.users.updateOne({ _id: userId }, { $set: patch });
	}

	async updateImportant(
		userId: string,
		patch: { username?: string; email?: string },
	): Promise<void> {
		await this.users.updateOne({ _id: userId }, { $set: patch });
	}

	async delete(userId: string): Promise<void> {
		// Postgres's thread.originalPosterId FK has no onDelete clause, which
		// defaults to RESTRICT — deleting a user who has authored threads is
		// rejected at the DB level. Mirrored explicitly here since Mongo has
		// no FK-level enforcement to fall back on.
		const hasThreads = await this.db
			.collection(COLLECTIONS.thread)
			.countDocuments({ originalPosterId: userId }, { limit: 1 });
		if (hasThreads > 0) {
			throw new Error(
				'Cannot delete user: they have authored threads (matches Postgres restrict behavior)',
			);
		}

		const session = this.db.client.startSession();
		try {
			await session.withTransaction(async () => {
				await this.db
					.collection(COLLECTIONS.session)
					.deleteMany({ userId }, { session });
				await this.db
					.collection(COLLECTIONS.account)
					.deleteMany({ userId }, { session });
				await this.db
					.collection(COLLECTIONS.twoFactor)
					.deleteMany({ userId }, { session });
				await this.db
					.collection(COLLECTIONS.follow)
					.deleteMany(
						{ $or: [{ followerId: userId }, { followeeId: userId }] },
						{ session },
					);
				await this.db
					.collection(COLLECTIONS.media)
					.deleteMany({ uploaderId: userId }, { session });

				const authoredPosts = await this.db
					.collection(COLLECTIONS.post)
					.find({ authorId: userId }, { session, projection: { _id: 1 } })
					.toArray();
				const postIds = authoredPosts.map((p) => p._id);
				if (postIds.length > 0) {
					await this.db
						.collection(COLLECTIONS.postLike)
						.deleteMany({ postId: { $in: postIds } }, { session });
					await this.db.collection(COLLECTIONS.postMention).deleteMany(
						{
							$or: [
								{ mentionerPostId: { $in: postIds } },
								{ mentionedPostId: { $in: postIds } },
							],
						},
						{ session },
					);
					await this.db
						.collection(COLLECTIONS.media)
						.updateMany(
							{ postId: { $in: postIds } },
							{ $set: { postId: null } },
							{ session },
						);
					await this.db
						.collection(COLLECTIONS.post)
						.deleteMany({ authorId: userId }, { session });
				}

				await this.users.deleteOne({ _id: userId }, { session });
			});
		} finally {
			await session.endSession();
		}
	}

	async getCredentialAccount(
		userId: string,
	): Promise<{ accountId: string; passwordHash: string } | null> {
		const account = await this.db
			.collection<AccountDoc>(COLLECTIONS.account)
			.findOne({ userId, providerId: 'credential' });
		if (!account?.password) return null;
		return { accountId: account._id, passwordHash: account.password };
	}

	async updateAccountPassword(
		accountId: string,
		passwordHash: string,
	): Promise<void> {
		await this.db
			.collection<AccountDoc>(COLLECTIONS.account)
			.updateOne({ _id: accountId }, { $set: { password: passwordHash } });
	}
}
