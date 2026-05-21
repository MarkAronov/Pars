import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/guards/session.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ThreadService } from './thread.service';
import { CreateThreadDto, PatchThreadDto } from './thread.dto';

interface AuthUser { id: string; role: string }

@ApiTags('threads')
@Controller('threads')
export class ThreadController {
	constructor(private readonly threadService: ThreadService) {}

	@Get()
	findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('topicId') topicId?: string) {
		return this.threadService.findAll(Number(page), Number(limit), topicId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.threadService.findById(id);
	}

	@Post()
	@UseGuards(SessionAuthGuard)
	create(@CurrentUser() user: AuthUser, @Body() dto: CreateThreadDto) {
		return this.threadService.create(user.id, dto);
	}

	@Patch(':id')
	@UseGuards(SessionAuthGuard)
	patch(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: PatchThreadDto) {
		return this.threadService.patch(id, user.id, user.role, dto);
	}

	@Delete(':id')
	@UseGuards(SessionAuthGuard)
	remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.threadService.delete(id, user.id, user.role);
	}
}
