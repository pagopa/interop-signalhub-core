import { inject } from "vitest";

import { setupTestContainersVitest } from "../src/setupTestContainersVitest.js";

export const { redisRateLimiter } = await setupTestContainersVitest(
  undefined,
  undefined,
  inject("redisRateLimiterConfig")
);

// afterEach(cleanup);
