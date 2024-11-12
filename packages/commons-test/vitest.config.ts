import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 60000,
    hookTimeout: 60000,
    globalSetup: ["./test/vitestGlobalSetup.ts"],
    setupFiles: ["dotenv-flow/config"],
  },
});
