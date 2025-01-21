import {
  BurstyRateLimiter,
  IRateLimiterRedisOptions,
  RateLimiterRedis,
  RateLimiterRes
} from "rate-limiter-flexible";
import {
  ConnectionTimeoutError,
  createClient as createRedisClient
} from "redis";
import { P, match } from "ts-pattern";

import { Logger, genericLogger } from "../logging/index.js";
import { RateLimiterStatus } from "./rateLimiterModel.js";

const burstKeyPrefix = "BURST_";

export interface RateLimiter {
  getRateLimitBurstCountBy: (rateLimiterKey: string) => Promise<number>;
  getRateLimitCountBy: (rateLimiterKey: string) => Promise<number>;
  rateLimitBy: (
    rateLimiterKey: string,
    logger: Logger
  ) => Promise<RateLimiterStatus>;
}

export async function initRedisRateLimiter(config: {
  limiterGroup: string;
  maxRequests: number;
  rateInterval: number;
  burstPercentage: number;
  redisHost: string;
  redisPort: number;
  timeout: number;
}): Promise<RateLimiter> {
  const redisClient = await createRedisClient({
    socket: {
      host: config.redisHost,
      port: config.redisPort,
      connectTimeout: config.timeout
    }
  })
    .on("error", (err) => genericLogger.warn(`Redis Client Error: ${err}`))
    .connect();

  const options: IRateLimiterRedisOptions = {
    storeClient: redisClient,
    keyPrefix: config.limiterGroup,
    points: config.maxRequests,
    duration: config.rateInterval / 1000 // seconds
  };

  const burstOptions: IRateLimiterRedisOptions = {
    storeClient: redisClient,
    keyPrefix: `${burstKeyPrefix}${config.limiterGroup}`,
    points: config.maxRequests * config.burstPercentage,
    duration: (config.rateInterval / 1000) * config.burstPercentage
  };

  const rateLimiter = new BurstyRateLimiter(
    new RateLimiterRedis(options),
    new RateLimiterRedis(burstOptions)
  );

  async function rateLimitBy(
    rateLimiterKey: string,
    logger: Logger
  ): Promise<RateLimiterStatus> {
    try {
      const rateLimiterResult = await rateLimiter.consume(rateLimiterKey);

      return {
        limitReached: false,
        maxRequests: config.maxRequests,
        remainingRequests: rateLimiterResult.remainingPoints,
        rateInterval: config.rateInterval,
        rateLimitReset: new Date(
          Date.now() + rateLimiterResult.msBeforeNext
        ).getTime()
      };
    } catch (error) {
      return match(error)
        .with(P.instanceOf(RateLimiterRes), (rejRes) => {
          logger.warn(
            `[RATE-LIMITER]: Rate-limit triggered for rateLimiterKey: ${rateLimiterKey}`
          );
          return {
            limitReached: true,
            maxRequests: config.maxRequests,
            remainingRequests: rejRes.remainingPoints,
            rateInterval: config.rateInterval,
            retryAfter: rejRes.msBeforeNext / 1000,
            rateLimitReset: new Date(Date.now() + rejRes.msBeforeNext).getTime()
          };
        })
        .with(P.intersection(P.instanceOf(ConnectionTimeoutError)), () => {
          logger.warn(
            `Redis command timed out, making request pass for rateLimiterKey ${rateLimiterKey}`
          );
          return {
            limitReached: false,
            maxRequests: config.maxRequests,
            remainingRequests: config.maxRequests,
            rateInterval: config.rateInterval
          };
        })
        .otherwise((error) => {
          logger.warn(
            `Unexpected error during rate limiting for organization ${rateLimiterKey} - ${error}`
          );
          return {
            limitReached: false,
            maxRequests: config.maxRequests,
            remainingRequests: config.maxRequests,
            rateInterval: config.rateInterval
          };
        });
    }
  }

  async function getRateLimitCountBy(organizationId: string): Promise<number> {
    return redisClient
      .get(`${config.limiterGroup}:${organizationId}`)
      .then(Number);
  }

  async function getRateLimitBurstCountBy(
    organizationId: string
  ): Promise<number> {
    return redisClient
      .get(`${burstKeyPrefix}${config.limiterGroup}:${organizationId}`)
      .then(Number);
  }

  return {
    rateLimitBy,
    getRateLimitCountBy,
    getRateLimitBurstCountBy
  };
}
