import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { SessionAuthGuard } from '../auth/guards/session.guard';
// biome-ignore lint/style/useImportType: NestJS ValidationPipe needs the real class at runtime to validate/transform @Body()
import { CreateTopicDto, PatchTopicDto } from './topic.dto';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { TopicService } from './topic.service';

@ApiTags('topics')
@Controller('topics')
export class TopicController {
	constructor(private readonly topicService: TopicService) {}

	@Get()
	findAll(@Query('page') page = 1, @Query('limit') limit = 50) {
		return this.topicService.findAll(Number(page), Number(limit));
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.topicService.findById(id);
	}

	@Post()
	@UseGuards(SessionAuthGuard, RolesGuard)
	@Roles('moderator', 'admin')
	create(@Body() dto: CreateTopicDto) {
		return this.topicService.create(dto);
	}

	@Patch(':id')
	@UseGuards(SessionAuthGuard, RolesGuard)
	@Roles('moderator', 'admin')
	patch(@Param('id') id: string, @Body() dto: PatchTopicDto) {
		return this.topicService.patch(id, dto);
	}

	@Delete(':id')
	@UseGuards(SessionAuthGuard, RolesGuard)
	@Roles('admin')
	remove(@Param('id') id: string) {
		return this.topicService.delete(id);
	}
}
