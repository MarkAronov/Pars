import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// biome-ignore lint/style/useImportType: NestJS DI token — runtime usage via emitDecoratorMetadata
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get()
	search(
		@Query('q') q = '',
		@Query('type') type = 'posts',
		@Query('page') page = 1,
		@Query('limit') limit = 20,
	) {
		return this.searchService.search(q, type, Number(page), Number(limit));
	}
}
