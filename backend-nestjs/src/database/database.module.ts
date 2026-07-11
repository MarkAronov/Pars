import { Global, Module } from '@nestjs/common';
import {
	FEED_REPOSITORY,
	FeedService,
	FOLLOW_REPOSITORY,
	MEDIA_REPOSITORY,
	MEDIA_STORAGE,
	MediaService,
	POST_REPOSITORY,
	PostgresFeedRepository,
	PostgresFollowRepository,
	PostgresMediaRepository,
	PostgresPostRepository,
	PostgresSearchRepository,
	PostgresThreadRepository,
	PostgresTopicRepository,
	PostgresUserRepository,
	PostService,
	SEARCH_REPOSITORY,
	SearchService,
	THREAD_REPOSITORY,
	ThreadService,
	TOPIC_REPOSITORY,
	TopicService,
	USER_REPOSITORY,
	UserService,
} from '@pars/db-adapters';
import { StorageModule } from '../storage/storage.module';
import { StorageService } from '../storage/storage.service';
import { DrizzleModule } from './drizzle.module';
import { DrizzleService } from './drizzle.service';

@Global()
@Module({
	imports: [DrizzleModule, StorageModule],
	providers: [
		{
			provide: USER_REPOSITORY,
			// Passes the DrizzleService instance itself, not `d.db` — `db` is only
			// assigned inside DrizzleService.onModuleInit(), which hasn't run yet
			// when this factory executes, so capturing `d.db` eagerly here would
			// freeze it at `undefined` for the repository's whole lifetime.
			useFactory: (d: DrizzleService) => new PostgresUserRepository(d),
			inject: [DrizzleService],
		},
		{
			provide: FOLLOW_REPOSITORY,
			useFactory: (d: DrizzleService) => new PostgresFollowRepository(d),
			inject: [DrizzleService],
		},
		{
			provide: POST_REPOSITORY,
			useFactory: (d: DrizzleService) => new PostgresPostRepository(d),
			inject: [DrizzleService],
		},
		{
			provide: THREAD_REPOSITORY,
			useFactory: (d: DrizzleService) => new PostgresThreadRepository(d),
			inject: [DrizzleService],
		},
		{
			provide: TOPIC_REPOSITORY,
			useFactory: (d: DrizzleService) => new PostgresTopicRepository(d),
			inject: [DrizzleService],
		},
		{
			provide: MEDIA_REPOSITORY,
			useFactory: (d: DrizzleService) => new PostgresMediaRepository(d),
			inject: [DrizzleService],
		},
		{
			provide: SEARCH_REPOSITORY,
			useFactory: (d: DrizzleService) => new PostgresSearchRepository(d),
			inject: [DrizzleService],
		},
		{
			provide: FEED_REPOSITORY,
			useFactory: (d: DrizzleService) => new PostgresFeedRepository(d),
			inject: [DrizzleService],
		},
		{ provide: MEDIA_STORAGE, useExisting: StorageService },
		{
			provide: UserService,
			useFactory: (users, follows) => new UserService(users, follows),
			inject: [USER_REPOSITORY, FOLLOW_REPOSITORY],
		},
		{
			provide: PostService,
			useFactory: (posts) => new PostService(posts),
			inject: [POST_REPOSITORY],
		},
		{
			provide: ThreadService,
			useFactory: (threads) => new ThreadService(threads),
			inject: [THREAD_REPOSITORY],
		},
		{
			provide: TopicService,
			useFactory: (topics) => new TopicService(topics),
			inject: [TOPIC_REPOSITORY],
		},
		{
			provide: FeedService,
			useFactory: (feed) => new FeedService(feed),
			inject: [FEED_REPOSITORY],
		},
		{
			provide: SearchService,
			useFactory: (search) => new SearchService(search),
			inject: [SEARCH_REPOSITORY],
		},
		{
			provide: MediaService,
			useFactory: (media, storage) => new MediaService(media, storage),
			inject: [MEDIA_REPOSITORY, MEDIA_STORAGE],
		},
	],
	exports: [
		UserService,
		PostService,
		ThreadService,
		TopicService,
		FeedService,
		SearchService,
		MediaService,
	],
})
export class DatabaseModule {}
