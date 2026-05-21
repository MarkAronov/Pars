import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { CreateTopicDto, PatchTopicDto } from './topic.dto';

@Injectable()
export class TopicService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(page: number, limit: number) {
		return this.prisma.topic.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } });
	}

	async findById(id: string) {
		const topic = await this.prisma.topic.findUnique({ where: { id } });
		if (!topic) throw new NotFoundException('Topic not found');
		return topic;
	}

	create(dto: CreateTopicDto) {
		return this.prisma.topic.create({ data: dto });
	}

	async patch(id: string, dto: PatchTopicDto) {
		const topic = await this.prisma.topic.findUnique({ where: { id } });
		if (!topic) throw new NotFoundException('Topic not found');
		return this.prisma.topic.update({ where: { id }, data: dto });
	}

	async delete(id: string) {
		const topic = await this.prisma.topic.findUnique({ where: { id } });
		if (!topic) throw new NotFoundException('Topic not found');
		await this.prisma.topic.delete({ where: { id } });
		return { message: 'Topic deleted' };
	}
}
