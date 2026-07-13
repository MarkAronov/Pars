import type { Document } from 'mongodb';
import type { PublicUser } from '../types';
import { COLLECTIONS, type UserDoc } from './collections';

// Mongo has no correlated-subquery equivalent to Postgres's inline
// `sql<number>` counts — a live $lookup+$size aggregation is the closest
// match. Deliberately not a denormalized counter field: that would introduce
// an eventual-consistency window Postgres's live subqueries don't have.
export function userAggregationStages(): Document[] {
	return [
		{
			$lookup: {
				from: COLLECTIONS.follow,
				localField: '_id',
				foreignField: 'followeeId',
				as: '_followersArr',
			},
		},
		{
			$lookup: {
				from: COLLECTIONS.follow,
				localField: '_id',
				foreignField: 'followerId',
				as: '_followingArr',
			},
		},
		{
			$lookup: {
				from: COLLECTIONS.post,
				localField: '_id',
				foreignField: 'authorId',
				as: '_postsArr',
			},
		},
		{
			$addFields: {
				_followers: { $size: '$_followersArr' },
				_following: { $size: '$_followingArr' },
				_posts: { $size: '$_postsArr' },
			},
		},
		{ $project: { _followersArr: 0, _followingArr: 0, _postsArr: 0 } },
	];
}

export type UserWithCounts = UserDoc & {
	_followers: number;
	_following: number;
	_posts: number;
};

export function toPublicUser(doc: UserWithCounts): PublicUser {
	return {
		id: doc._id,
		username: doc.username,
		displayName: doc.displayName,
		bio: doc.bio,
		avatarUrl: doc.avatarUrl,
		backgroundUrl: doc.backgroundUrl,
		role: doc.role,
		verified: doc.verified,
		createdAt: doc.createdAt,
		_count: {
			followers: doc._followers,
			following: doc._following,
			posts: doc._posts,
		},
	};
}
