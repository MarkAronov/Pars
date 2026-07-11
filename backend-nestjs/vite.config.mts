import path from "node:path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig(() => {
	return {
		plugins: [
			// Vite's default esbuild transform doesn't support emitDecoratorMetadata,
			// so NestJS constructor injection silently resolves to `undefined` under
			// vitest without this — see https://docs.nestjs.com/recipes/swc#vitest
			swc.vite({ module: { type: "es6" } }),
		],
		test: {
			globalSetup: "./__tests__/globalSetup.ts",
			setupFiles: "./__tests__/setup.ts",
			isolate: true,
			environment: "node",
			// Testcontainers can take time to pull images on first run
			testTimeout: 60_000,
			hookTimeout: 60_000,
			// `sequence.concurrent: false` alone only serializes tests *within* a
			// file — files still run concurrently in separate workers by default.
			// All files share one globalSetup Postgres container, and each file's
			// afterEach wipes the whole users/sessions tables, so concurrent files
			// were wiping each other's data mid-test. fileParallelism is what
			// actually serializes file execution.
			fileParallelism: false,
			sequence: {
				concurrent: false,
			},
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
	};
});
