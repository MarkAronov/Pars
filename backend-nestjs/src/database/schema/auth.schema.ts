import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const sessions = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		expiresAt: timestamp('expires_at', { mode: 'date' }),
		password: text('password'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdateFn(() => new Date()),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
	},
	(t) => [
		unique('account_provider_account_unique').on(t.providerId, t.accountId),
	],
);

export const verifications = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
});

export const twoFactors = pgTable('two_factor', {
	id: text('id').primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
});
