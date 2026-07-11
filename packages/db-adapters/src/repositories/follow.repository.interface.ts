import type { PublicUser } from '../types';

export interface FollowRepository {
	userExists(userId: string): Promise<boolean>;
	isFollowing(followerId: string, followeeId: string): Promise<boolean>;
	follow(followerId: string, followeeId: string): Promise<void>;
	unfollow(followerId: string, followeeId: string): Promise<void>;
	getFollowers(
		userId: string,
		page: number,
		limit: number,
	): Promise<PublicUser[]>;
	getFollowing(
		userId: string,
		page: number,
		limit: number,
	): Promise<PublicUser[]>;
}
