import {
	boolean,
	customType,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';
import { threads } from './thread.schema';
import { users } from './user.schema';

const vector = customType<{
	data: number[];
	driverData: string;
	config: { dimensions: number };
}>({
	dataType(config) {
		return `vector(${config?.dimensions ?? 1536})`;
	},
	fromDriver(value: string) {
		return value.slice(1, -1).split(',').map(Number);
	},
	toDriver(value: number[]) {
		return `[${value.join(',')}]`;
	},
});

export const posts = pgTable(
	'post',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: text('title'),
		content: text('content').notNull(),
		edited: boolean('edited').notNull().default(false),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdateFn(() => new Date()),
		embedding: vector('embedding', { dimensions: 1536 }),
		authorId: text('author_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		threadId: text('thread_id').references(() => threads.id, {
			onDelete: 'set null',
		}),
	},
	() => [],
);

export const postLikes = pgTable(
	'post_like',
	{
		postId: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		userId: text('user_id').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

export const postMentions = pgTable(
	'post_mention',
	{
		mentionerPostId: text('mentioner_post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		mentionedPostId: text('mentioned_post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
	},
	(t) => [primaryKey({ columns: [t.mentionerPostId, t.mentionedPostId] })],
);
