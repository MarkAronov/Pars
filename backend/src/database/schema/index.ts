// Re-export all tables and enums

export * from './auth.schema';
export * from './media.schema';
export * from './post.schema';
export * from './thread.schema';
export * from './topic.schema';
export * from './user.schema';

// Relations (required for drizzle relational query API)
import { relations } from 'drizzle-orm';
import { accounts, sessions, twoFactors } from './auth.schema';
import { media } from './media.schema';
import { postLikes, postMentions, posts } from './post.schema';
import { threads } from './thread.schema';
import { topics } from './topic.schema';
import { follows, users } from './user.schema';

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	accounts: many(accounts),
	twoFactors: many(twoFactors),
	posts: many(posts),
	following: many(follows, { relationName: 'follower' }),
	followers: many(follows, { relationName: 'followee' }),
	media: many(media),
	threads: many(threads),
}));

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: 'follower',
	}),
	followee: one(users, {
		fields: [follows.followeeId],
		references: [users.id],
		relationName: 'followee',
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const twoFactorsRelations = relations(twoFactors, ({ one }) => ({
	user: one(users, { fields: [twoFactors.userId], references: [users.id] }),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
	threads: many(threads),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
	topic: one(topics, { fields: [threads.topicId], references: [topics.id] }),
	originalPoster: one(users, {
		fields: [threads.originalPosterId],
		references: [users.id],
	}),
	posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(users, { fields: [posts.authorId], references: [users.id] }),
	thread: one(threads, { fields: [posts.threadId], references: [threads.id] }),
	likes: many(postLikes),
	media: many(media),
	mentioning: many(postMentions, { relationName: 'mentioner' }),
	mentionedBy: many(postMentions, { relationName: 'mentioned' }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
	post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
}));

export const postMentionsRelations = relations(postMentions, ({ one }) => ({
	mentioner: one(posts, {
		fields: [postMentions.mentionerPostId],
		references: [posts.id],
		relationName: 'mentioner',
	}),
	mentioned: one(posts, {
		fields: [postMentions.mentionedPostId],
		references: [posts.id],
		relationName: 'mentioned',
	}),
}));

export const mediaRelations = relations(media, ({ one }) => ({
	uploader: one(users, { fields: [media.uploaderId], references: [users.id] }),
	post: one(posts, { fields: [media.postId], references: [posts.id] }),
}));
