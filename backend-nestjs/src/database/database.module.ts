import { Global, Module, type Provider } from '@nestjs/common';
import {
	FEED_REPOSITORY,
	FeedService,
	FOLLOW_REPOSITORY,
	MEDIA_REPOSITORY,
	MEDIA_STORAGE,
	MediaService,
	MongoFeedRepository,
	MongoFollowRepository,
	MongoMediaRepository,
	MongoPostRepository,
	MongoSearchRepository,
	MongoThreadRepository,
	MongoTopicRepository,
	MongoUserRepository,
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
import { MongoModule } from './mongo.module';
import { MongoService } from './mongo.service';

// Both Postgres and Mongo providers reference their own connection service
// instance directly (not `.db`) — the connection's `db` property is only
// assigned inside that service's onModuleInit(), which hasn't run yet when
// these factories execute, so capturing it eagerly would freeze it at
// `undefined` for the repository's whole lifetime. Both PostgresXRepository
// and MongoXRepository read `.db` lazily per-call instead.
const repositoryProviders: Provider[] =
	process.env.DATABASE_DRIVER === 'mongo'
		? [
				{
					provide: USER_REPOSITORY,
					useFactory: (m: MongoService) => new MongoUserRepository(m),
					inject: [MongoService],
				},
				{
					provide: FOLLOW_REPOSITORY,
					useFactory: (m: MongoService) => new MongoFollowRepository(m),
					inject: [MongoService],
				},
				{
					provide: POST_REPOSITORY,
					useFactory: (m: MongoService) => new MongoPostRepository(m),
					inject: [MongoService],
				},
				{
					provide: THREAD_REPOSITORY,
					useFactory: (m: MongoService) => new MongoThreadRepository(m),
					inject: [MongoService],
				},
				{
					provide: TOPIC_REPOSITORY,
					useFactory: (m: MongoService) => new MongoTopicRepository(m),
					inject: [MongoService],
				},
				{
					provide: MEDIA_REPOSITORY,
					useFactory: (m: MongoService) => new MongoMediaRepository(m),
					inject: [MongoService],
				},
				{
					provide: SEARCH_REPOSITORY,
					useFactory: (m: MongoService) => new MongoSearchRepository(m),
					inject: [MongoService],
				},
				{
					provide: FEED_REPOSITORY,
					useFactory: (m: MongoService) => new MongoFeedRepository(m),
					inject: [MongoService],
				},
			]
		: [
				{
					provide: USER_REPOSITORY,
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
			];

@Global()
@Module({
	imports: [DrizzleModule, MongoModule, StorageModule],
	providers: [
		...repositoryProviders,
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
