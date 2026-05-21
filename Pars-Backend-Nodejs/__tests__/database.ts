/**
 * Shared test helper — re-exports the app and prisma handles from setup.ts
 * so individual test files don't need to import from two places.
 */
export { app, prisma } from './setup';
