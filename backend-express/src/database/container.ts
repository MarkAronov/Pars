import {
	MongoFollowRepository,
	MongoPostRepository,
	MongoUserRepository,
	PostgresFollowRepository,
	PostgresPostRepository,
	PostgresUserRepository,
	PostService,
	UserService,
} from '@pars/db-adapters';
import type { Db } from 'mongodb';
import type { DrizzleDb } from './drizzle';

// Manual composition root — Express has no DI container, so this builds the
// full repository/service set once at boot from an already-connected db
// handle, mirroring how backend-nestjs's DatabaseModule picks Postgres vs
// Mongo repositories based on DATABASE_DRIVER, just without the framework.
export interface RepositorySet {
	userService: UserService;
	postService: PostService;
}

export const buildContainer = (
	drizzleDb: DrizzleDb | null,
	mongoDb: Db | null,
): RepositorySet => {
	if (mongoDb) {
		const users = new MongoUserRepository({ db: mongoDb });
		const follows = new MongoFollowRepository({ db: mongoDb });
		const posts = new MongoPostRepository({ db: mongoDb });
		return {
			userService: new UserService(users, follows),
			postService: new PostService(posts),
		};
	}

	const db = drizzleDb as DrizzleDb;
	const users = new PostgresUserRepository({ db });
	const follows = new PostgresFollowRepository({ db });
	const posts = new PostgresPostRepository({ db });
	return {
		userService: new UserService(users, follows),
		postService: new PostService(posts),
	};
};
