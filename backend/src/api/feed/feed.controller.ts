import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/guards/session.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeedService } from './feed.service';

interface AuthUser { id: string }

@ApiTags('feed')
@Controller('feed')
export class FeedController {
	constructor(private readonly feedService: FeedService) {}

	@Get()
	@UseGuards(SessionAuthGuard)
	getFeed(
		@CurrentUser() user: AuthUser,
		@Query('page') page = 1,
		@Query('limit') limit = 20,
	) {
		return this.feedService.getForUser(user.id, Number(page), Number(limit));
	}
}
