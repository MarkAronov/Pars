import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import * as argon2 from 'argon2';
import { and, eq, or, sql } from 'drizzle-orm';
import type { DrizzleService } from '../../database/drizzle.service';
import { accounts, follows, posts, users } from '../../database/schema';
import type {
	PatchUserImportantDto,
	PatchUserPasswordDto,
	PatchUserRegularDto,
} from './user.dto';

function publicSelect() {
	return {
		id: users.id,
		username: users.username,
		displayName: users.displayName,
		bio: users.bio,
		avatarUrl: users.avatarUrl,
		backgroundUrl: users.backgroundUrl,
		role: users.role,
		verified: users.verified,
		createdAt: users.createdAt,
		_followers: sql<number>`(select count(*)::int from ${follows} where ${follows.followeeId} = ${users.id})`,
		_following: sql<number>`(select count(*)::int from ${follows} where ${follows.followerId} = ${users.id})`,
		_posts: sql<number>`(select count(*)::int from ${posts} where ${posts.authorId} = ${users.id})`,
	};
}

function toPublicUser<
	T extends { _followers: number; _following: number; _posts: number },
>(row: T) {
	const { _followers, _following, _posts, ...rest } = row;
	return {
		...rest,
		_count: { followers: _followers, following: _following, posts: _posts },
	};
}

@Injectable()
export class UserService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findAll(page: number, limit: number) {
		const rows = await this.drizzle.db
			.select(publicSelect())
			.from(users)
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toPublicUser);
	}

	async findById(id: string) {
		const [row] = await this.drizzle.db
			.select(publicSelect())
			.from(users)
			.where(eq(users.id, id));
		if (!row) throw new NotFoundException('User not found');
		return toPublicUser(row);
	}

	async findByIdOrUsername(idOrUsername: string) {
		const [row] = await this.drizzle.db
			.select(publicSelect())
			.from(users)
			.where(or(eq(users.id, idOrUsername), eq(users.username, idOrUsername)))
			.limit(1);
		if (!row) throw new NotFoundException('User not found');
		return toPublicUser(row);
	}

	async patchRegular(userId: string, dto: PatchUserRegularDto) {
		await this.drizzle.db.update(users).set(dto).where(eq(users.id, userId));
		return this.findById(userId);
	}

	async patchImportant(userId: string, dto: PatchUserImportantDto) {
		const [account] = await this.drizzle.db
			.select({ id: accounts.id, password: accounts.password })
			.from(accounts)
			.where(
				and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')),
			)
			.limit(1);
		if (!account?.password) throw new UnauthorizedException();
		const valid = await argon2.verify(account.password, dto.currentPassword);
		if (!valid) throw new UnauthorizedException('Wrong password');

		const { currentPassword: _, ...updateData } = dto;
		await this.drizzle.db
			.update(users)
			.set(updateData)
			.where(eq(users.id, userId));
		return this.findById(userId);
	}

	async patchPassword(userId: string, dto: PatchUserPasswordDto) {
		const [account] = await this.drizzle.db
			.select({ id: accounts.id, password: accounts.password })
			.from(accounts)
			.where(
				and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')),
			)
			.limit(1);
		if (!account?.password) throw new UnauthorizedException();
		const valid = await argon2.verify(account.password, dto.currentPassword);
		if (!valid) throw new UnauthorizedException('Wrong password');

		const newHash = await argon2.hash(dto.newPassword);
		await this.drizzle.db
			.update(accounts)
			.set({ password: newHash })
			.where(eq(accounts.id, account.id));
		return { message: 'Password updated' };
	}

	async deleteUser(
		requesterId: string,
		targetId: string,
		requesterRole: string,
	) {
		if (requesterId !== targetId && requesterRole !== 'admin') {
			throw new ForbiddenException();
		}
		await this.drizzle.db.delete(users).where(eq(users.id, targetId));
		return { message: 'User deleted' };
	}

	async follow(followerId: string, followeeId: string) {
		if (followerId === followeeId)
			throw new BadRequestException('Cannot follow yourself');
		const [target] = await this.drizzle.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, followeeId))
			.limit(1);
		if (!target) throw new NotFoundException('User not found');
		const [existing] = await this.drizzle.db
			.select({ followerId: follows.followerId })
			.from(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followeeId, followeeId),
				),
			)
			.limit(1);
		if (existing) throw new ConflictException('Already following');
		await this.drizzle.db.insert(follows).values({ followerId, followeeId });
		return { following: true };
	}

	async unfollow(followerId: string, followeeId: string) {
		const [existing] = await this.drizzle.db
			.select({ followerId: follows.followerId })
			.from(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followeeId, followeeId),
				),
			)
			.limit(1);
		if (!existing) throw new NotFoundException('Not following this user');
		await this.drizzle.db
			.delete(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followeeId, followeeId),
				),
			);
		return { following: false };
	}

	async getFollowers(userId: string, page: number, limit: number) {
		const rows = await this.drizzle.db
			.select(publicSelect())
			.from(users)
			.innerJoin(follows, eq(follows.followerId, users.id))
			.where(eq(follows.followeeId, userId))
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toPublicUser);
	}

	async getFollowing(userId: string, page: number, limit: number) {
		const rows = await this.drizzle.db
			.select(publicSelect())
			.from(users)
			.innerJoin(follows, eq(follows.followeeId, users.id))
			.where(eq(follows.followerId, userId))
			.limit(limit)
			.offset((page - 1) * limit);
		return rows.map(toPublicUser);
	}
}
