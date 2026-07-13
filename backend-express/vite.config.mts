import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
	return {
		test: {
			globalSetup: './__tests__/globalSetup.ts',
			setupFiles: './__tests__/setup.ts',
			isolate: true,
			environment: 'node',
			testTimeout: 60_000,
			hookTimeout: 60_000,
			// Mirrors backend-nestjs's vite.config.mts: all files share one
			// globalSetup container, and each file's afterEach wipes the shared
			// tables/collections, so concurrent files would wipe each other's
			// data mid-test without this.
			fileParallelism: false,
			sequence: {
				concurrent: false,
			},
		},
		resolve: {
			alias: { '@': path.resolve(__dirname, 'src') },
		},
	};
});
