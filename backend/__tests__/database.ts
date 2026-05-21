/**
 * Shared test helper — re-exports the app and prisma handles from setup.ts
 * so individual test files don't need to import from two places.
 */
export { app, prisma } from './setup';

// Lazy getters used by test files that prefer function-style access
import { app as _app, prisma as _prisma } from './setup';
export const getApp = () => Promise.resolve(_app);
export const getPrisma = () => _prisma;
