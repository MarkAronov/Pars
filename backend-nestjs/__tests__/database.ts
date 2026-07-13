/**
 * Shared test helper — re-exports the app/drizzle/mongo handles from setup.ts
 * so individual test files don't need to import from two places.
 */
export { app, drizzle, mongo } from './setup';

// Lazy getters used by test files that prefer function-style access
import { app as _app, drizzle as _drizzle, mongo as _mongo } from './setup';
export const getApp = () => Promise.resolve(_app);
export const getDrizzle = () => _drizzle;
export const getMongo = () => _mongo;
