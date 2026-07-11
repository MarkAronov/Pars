import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// biome-ignore lint/style/useImportType: NestJS ValidationPipe needs the real class at runtime to validate/transform @Body()
import { CreatePostDto, PatchPostDto, PostService } from '@pars/db-adapters';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SessionAuthGuard } from '../auth/guards/session.guard';

interface AuthUser {
	id: string;
	role: string;
}

@ApiTags('posts')
@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get()
	findAll(
		@Query('page') page = 1,
		@Query('limit') limit = 20,
		@Query('authorId') authorId?: string,
	) {
		return this.postService.findAll(Number(page), Number(limit), authorId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.postService.findById(id);
	}

	@Post()
	@HttpCode(201)
	@UseGuards(SessionAuthGuard)
	create(@CurrentUser() user: AuthUser, @Body() dto: CreatePostDto) {
		return this.postService.create(user.id, dto);
	}

	@Patch(':id')
	@UseGuards(SessionAuthGuard)
	patch(
		@Param('id') id: string,
		@CurrentUser() user: AuthUser,
		@Body() dto: PatchPostDto,
	) {
		return this.postService.patch(id, user.id, user.role, dto);
	}

	@Delete(':id')
	@UseGuards(SessionAuthGuard)
	remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.postService.delete(id, user.id, user.role);
	}

	@Post(':id/like')
	@UseGuards(SessionAuthGuard)
	like(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.postService.toggleLike(id, user.id);
	}
}
