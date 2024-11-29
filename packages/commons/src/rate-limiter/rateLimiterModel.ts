export type RateLimiterStatus = {
  limitReached: boolean;
  maxRequests: number;
  rateInterval: number;
  remainingRequests: number;
  retryAfter?: number;
  rateLimitReset?: number;
};
