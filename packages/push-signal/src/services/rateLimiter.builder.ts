import { RateLimiter, initRedisRateLimiter } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export async function rateLimiterBuilder(): Promise<{
  rateLimiter: RateLimiter;
}> {
  const rateLimiter = await initRedisRateLimiter({
    limiterGroup: "PUSH-SIGNAL-RL",
    maxRequests: config.rateLimiterMaxRequests,
    rateInterval: config.rateLimiterRateInterval,
    burstPercentage: config.rateLimiterBurstPercentage,
    redisHost: config.rateLimiterRedisHost,
    redisPort: config.rateLimiterRedisPort,
    timeout: config.rateLimiterTimeout
  });

  return {
    rateLimiter
  };
}
