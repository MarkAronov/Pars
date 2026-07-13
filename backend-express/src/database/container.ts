import {
	FeedService,
	MediaService,
	MongoFeedRepository,
	MongoFollowRepository,
	MongoMediaRepository,
	MongoPostRepository,
	MongoSearchRepository,
	MongoThreadRepository,
	MongoTopicRepository,
	MongoUserRepository,
	PostgresFeedRepository,
	PostgresFollowRepository,
	PostgresMediaRepository,
	PostgresPostRepository,
	PostgresSearchRepository,
	PostgresThreadRepository,
	PostgresTopicRepository,
	PostgresUserRepository,
	PostService,
	SearchService,
	ThreadService,
	TopicService,
	UserService,
} from '@pars/db-adapters';
import type { Db } from 'mongodb';
import type { StorageProvider } from '../storage/storage.interface';
import type { DrizzleDb } from './drizzle';

// Manual composition root — Express has no DI container, so this builds the
// full repository/service set once at boot from an already-connected db
// handle, mirroring how backend-nestjs's DatabaseModule picks Postgres vs
// Mongo repositories based on DATABASE_DRIVER, just without the framework.
export interface RepositorySet {
	userService: UserService;
	postService: PostService;
	threadService: ThreadService;
	topicService: TopicService;
	searchService: SearchService;
	feedService: FeedService;
	mediaService: MediaService;
}

export const buildContainer = (
	drizzleDb: DrizzleDb | null,
	mongoDb: Db | null,
	storage: StorageProvider,
): RepositorySet => {
	if (mongoDb) {
		const users = new MongoUserRepository({ db: mongoDb });
		const follows = new MongoFollowRepository({ db: mongoDb });
		const posts = new MongoPostRepository({ db: mongoDb });
		const threads = new MongoThreadRepository({ db: mongoDb });
		const topics = new MongoTopicRepository({ db: mongoDb });
		const search = new MongoSearchRepository({ db: mongoDb });
		const feed = new MongoFeedRepository({ db: mongoDb });
		const media = new MongoMediaRepository({ db: mongoDb });
		return {
			userService: new UserService(users, follows),
			postService: new PostService(posts),
			threadService: new ThreadService(threads),
			topicService: new TopicService(topics),
			searchService: new SearchService(search),
			feedService: new FeedService(feed),
			mediaService: new MediaService(media, storage),
		};
	}

	const db = drizzleDb as DrizzleDb;
	const users = new PostgresUserRepository({ db });
	const follows = new PostgresFollowRepository({ db });
	const posts = new PostgresPostRepository({ db });
	const threads = new PostgresThreadRepository({ db });
	const topics = new PostgresTopicRepository({ db });
	const search = new PostgresSearchRepository({ db });
	const feed = new PostgresFeedRepository({ db });
	const media = new PostgresMediaRepository({ db });
	return {
		userService: new UserService(users, follows),
		postService: new PostService(posts),
		threadService: new ThreadService(threads),
		topicService: new TopicService(topics),
		searchService: new SearchService(search),
		feedService: new FeedService(feed),
		mediaService: new MediaService(media, storage),
	};
};
