export type UserRole = 'user' | 'moderator' | 'admin';

export interface PublicUser {
	id: string;
	username: string | null;
	displayName: string | null;
	bio: string | null;
	avatarUrl: string | null;
	backgroundUrl: string | null;
	role: UserRole;
	verified: boolean;
	createdAt: Date;
	_count: { followers: number; following: number; posts: number };
}

export interface PublicAuthor {
	id: string;
	username: string | null;
	displayName: string | null;
	avatarUrl: string | null;
	verified: boolean;
}

export interface PublicPost {
	id: string;
	title: string | null;
	content: string;
	edited: boolean;
	createdAt: Date;
	updatedAt: Date;
	threadId: string | null;
	author: PublicAuthor;
	_count: { likes: number; mentionedBy: number };
}

export interface PublicThread {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	topic: { id: string; name: string };
	originalPoster: Omit<PublicAuthor, 'verified'>;
	_count: { posts: number };
}

export interface PublicTopic {
	id: string;
	name: string;
	description: string | null;
}

export interface FeedPost {
	id: string;
	title: string | null;
	content: string;
	createdAt: Date;
	author: Omit<PublicAuthor, 'verified'> & { verified: boolean };
	_count: { likes: number };
}

export interface FeedResult {
	posts: FeedPost[];
	total: number;
	page: number;
	limit: number;
}

export interface SearchUserResult {
	id: string;
	username: string | null;
	displayName: string | null;
	avatarUrl: string | null;
	verified: boolean;
}

export interface SearchPostResult {
	id: string;
	title: string | null;
	content: string;
	createdAt: Date;
	author: Omit<PublicAuthor, 'verified'>;
}

export interface MediaRecord {
	id: string;
	url: string;
	type: 'IMAGE' | 'VIDEO' | 'AVATAR' | 'BACKGROUND';
	mimeType: string;
	size: number;
	uploaderId: string;
	postId: string | null;
}
