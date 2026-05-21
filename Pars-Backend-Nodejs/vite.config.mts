import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig(() => {
	return {
		test: {
			globalSetup: "./__tests__/globalSetup.ts",
			setupFiles: "./__tests__/setup.ts",
			isolate: true,
			environment: "node",
			// Testcontainers can take time to pull images on first run
			testTimeout: 60_000,
			hookTimeout: 60_000,
			sequence: {
				// Run test files sequentially to avoid container port conflicts
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
