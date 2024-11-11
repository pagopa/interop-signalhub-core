import { Logger } from "../logging/index.js";

export type RateLimiterStatus = {
  limitReached: boolean;
  maxRequests: number;
  rateInterval: number;
  remainingRequests: number;
};

export type RateLimiter = {
  rateLimitBy: (
    rateLimiterKey: string,
    logger: Logger
  ) => Promise<RateLimiterStatus>;
  getRateLimitCountBy: (rateLimiterKey: string) => Promise<number>;
  getRateLimitBurstCountby: (rateLimiterKey: string) => Promise<number>;
};
