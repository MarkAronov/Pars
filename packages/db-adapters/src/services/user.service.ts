import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import type {
	PatchUserImportantDto,
	PatchUserPasswordDto,
	PatchUserRegularDto,
} from '../dto/user.dto';
import type { FollowRepository } from '../repositories/follow.repository.interface';
import type { UserRepository } from '../repositories/user.repository.interface';

export class UserService {
	constructor(
		private readonly users: UserRepository,
		private readonly follows: FollowRepository,
	) {}

	async findAll(page: number, limit: number) {
		return this.users.findAll(page, limit);
	}

	async findById(id: string) {
		const user = await this.users.findById(id);
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findByIdOrUsername(idOrUsername: string) {
		const user = await this.users.findByIdOrUsername(idOrUsername);
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async patchRegular(userId: string, dto: PatchUserRegularDto) {
		await this.users.updateRegular(userId, dto);
		return this.findById(userId);
	}

	async patchImportant(userId: string, dto: PatchUserImportantDto) {
		const account = await this.users.getCredentialAccount(userId);
		if (!account) throw new UnauthorizedException();
		const valid = await argon2.verify(
			account.passwordHash,
			dto.currentPassword,
		);
		if (!valid) throw new UnauthorizedException('Wrong password');

		const { currentPassword: _, ...updateData } = dto;
		await this.users.updateImportant(userId, updateData);
		return this.findById(userId);
	}

	async patchPassword(userId: string, dto: PatchUserPasswordDto) {
		const account = await this.users.getCredentialAccount(userId);
		if (!account) throw new UnauthorizedException();
		const valid = await argon2.verify(
			account.passwordHash,
			dto.currentPassword,
		);
		if (!valid) throw new UnauthorizedException('Wrong password');

		const newHash = await argon2.hash(dto.newPassword);
		await this.users.updateAccountPassword(account.accountId, newHash);
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
		await this.users.delete(targetId);
		return { message: 'User deleted' };
	}

	async isFollowing(
		requesterId: string,
		targetId: string,
	): Promise<{ isFollowing: boolean }> {
		if (requesterId === targetId) return { isFollowing: false };
		return {
			isFollowing: await this.follows.isFollowing(requesterId, targetId),
		};
	}

	async follow(followerId: string, followeeId: string) {
		if (followerId === followeeId) {
			throw new BadRequestException('Cannot follow yourself');
		}
		const targetExists = await this.follows.userExists(followeeId);
		if (!targetExists) throw new NotFoundException('User not found');
		const existing = await this.follows.isFollowing(followerId, followeeId);
		if (existing) throw new ConflictException('Already following');
		await this.follows.follow(followerId, followeeId);
		return { following: true };
	}

	async unfollow(followerId: string, followeeId: string) {
		const existing = await this.follows.isFollowing(followerId, followeeId);
		if (!existing) throw new NotFoundException('Not following this user');
		await this.follows.unfollow(followerId, followeeId);
		return { following: false };
	}

	async getFollowers(userId: string, page: number, limit: number) {
		return this.follows.getFollowers(userId, page, limit);
	}

	async getFollowing(userId: string, page: number, limit: number) {
		return this.follows.getFollowing(userId, page, limit);
	}
}
