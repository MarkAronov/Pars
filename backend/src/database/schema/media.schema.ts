import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { posts } from './post.schema';
import { users } from './user.schema';

export const mediaTypeEnum = pgEnum('media_type', [
	'IMAGE',
	'VIDEO',
	'AVATAR',
	'BACKGROUND',
]);

export const media = pgTable('media', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	url: text('url').notNull(),
	type: mediaTypeEnum('type').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	uploaderId: text('uploader_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	postId: text('post_id').references(() => posts.id, { onDelete: 'set null' }),
});
