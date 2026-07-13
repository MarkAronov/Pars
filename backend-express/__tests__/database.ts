/**
 * Shared test helper — re-exports the app/drizzle/mongo handles from setup.ts.
 */
export { app, drizzleDb, mongoDb } from './setup';

import {
	app as _app,
	drizzleDb as _drizzleDb,
	mongoDb as _mongoDb,
} from './setup';
export const getApp = () => Promise.resolve(_app);
export const getDrizzle = () => _drizzleDb;
export const getMongo = () => _mongoDb;
