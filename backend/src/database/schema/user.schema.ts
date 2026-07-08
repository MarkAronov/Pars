import {
	boolean,
	customType,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';

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

export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin']);

export const users = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	username: text('username').unique(),
	displayName: text('display_name'),
	bio: text('bio').default(''),
	avatarUrl: text('avatar_url'),
	backgroundUrl: text('background_url'),
	role: userRoleEnum('role').notNull().default('user'),
	verified: boolean('verified').notNull().default(false),
	settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
	twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
	embedding: vector('embedding', { dimensions: 1536 }),
});

export const follows = pgTable(
	'follow',
	{
		followerId: text('follower_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		followeeId: text('followee_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(t) => [primaryKey({ columns: [t.followerId, t.followeeId] })],
);
