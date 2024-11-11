import {
  DB,
  RateLimiter,
  createDbInstance,
  initRedisRateLimiter
} from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { InteropService, interopServiceBuilder } from "./interop.service.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";
export function serviceBuilder(): {
  signalService: SignalService;
  interopService: InteropService;
  rateLimiter: RateLimiter;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
    maxConnectionPool: config.maxConnectionPool
  });
  const signalService = signalServiceBuilder(db);
  const interopService = interopServiceBuilder(db);

  // Rate limiter Init

  const rateLimiter = initRedisRateLimiter({
    limiterGroup: "PULL-SIGNAL-RL",
    maxRequests: config.rateLimiterMaxRequests,
    rateInterval: config.rateLimiterRateInterval,
    burstPercentage: config.rateLimiterBurstPercentage,
    redisHost: config.rateLimiterRedisHost,
    redisPort: config.rateLimiterRedisPort,
    timeout: config.rateLimiterTimeout
  });
  return {
    signalService,
    interopService,
    rateLimiter
  };
}
