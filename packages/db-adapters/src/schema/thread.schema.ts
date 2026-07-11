import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { topics } from './topic.schema';
import { users } from './user.schema';

export const threads = pgTable('thread', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	topicId: text('topic_id')
		.notNull()
		.references(() => topics.id, { onDelete: 'cascade' }),
	originalPosterId: text('original_poster_id')
		.notNull()
		.references(() => users.id),
});
