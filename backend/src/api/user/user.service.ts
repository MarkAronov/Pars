import {
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import type { PatchUserImportantDto, PatchUserPasswordDto, PatchUserRegularDto } from './user.dto';

const PUBLIC_SELECT = {
	id: true,
	username: true,
	displayName: true,
	bio: true,
	avatarUrl: true,
	backgroundUrl: true,
	role: true,
	verified: true,
	createdAt: true,
	_count: { select: { followers: true, following: true, posts: true } },
} as const;

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(page: number, limit: number) {
		const skip = (page - 1) * limit;
		return this.prisma.user.findMany({ skip, take: limit, select: PUBLIC_SELECT });
	}

	async findById(id: string) {
		const user = await this.prisma.user.findUnique({ where: { id }, select: PUBLIC_SELECT });
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async findByIdOrUsername(idOrUsername: string) {
		const user = await this.prisma.user.findFirst({
			where: { OR: [{ id: idOrUsername }, { username: idOrUsername }] },
			select: PUBLIC_SELECT,
		});
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async patchRegular(userId: string, dto: PatchUserRegularDto) {
		return this.prisma.user.update({ where: { id: userId }, data: dto, select: PUBLIC_SELECT });
	}

	async patchImportant(userId: string, dto: PatchUserImportantDto) {
		const account = await this.prisma.account.findFirst({
			where: { userId, providerId: 'credential' },
		});
		if (!account?.password) throw new UnauthorizedException();
		const valid = await argon2.verify(account.password, dto.currentPassword);
		if (!valid) throw new UnauthorizedException('Wrong password');

		const { currentPassword: _, ...updateData } = dto;
		return this.prisma.user.update({
			where: { id: userId },
			data: updateData,
			select: PUBLIC_SELECT,
		});
	}

	async patchPassword(userId: string, dto: PatchUserPasswordDto) {
		const account = await this.prisma.account.findFirst({
			where: { userId, providerId: 'credential' },
		});
		if (!account?.password) throw new UnauthorizedException();
		const valid = await argon2.verify(account.password, dto.currentPassword);
		if (!valid) throw new UnauthorizedException('Wrong password');

		const newHash = await argon2.hash(dto.newPassword);
		await this.prisma.account.update({
			where: { id: account.id },
			data: { password: newHash },
		});
		return { message: 'Password updated' };
	}

	async deleteUser(requesterId: string, targetId: string, requesterRole: string) {
		if (requesterId !== targetId && requesterRole !== 'admin') {
			throw new ForbiddenException();
		}
		await this.prisma.user.delete({ where: { id: targetId } });
		return { message: 'User deleted' };
	}
}
