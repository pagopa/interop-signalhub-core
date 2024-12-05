import { OutgoingHttpHeaders } from "http2";

import { RateLimiterStatus } from "./rateLimiterModel.js";

export const rateLimiterHeadersFromStatus = (
  rateLimiterStatus: Omit<RateLimiterStatus, "limitReached">
): OutgoingHttpHeaders => {
  let headers: OutgoingHttpHeaders = {
    "X-Rate-Limit-Limit": rateLimiterStatus.maxRequests,
    "X-Rate-Limit-Interval": rateLimiterStatus.rateInterval,
    "X-Rate-Limit-Remaining": rateLimiterStatus.remainingRequests
  };

  if (rateLimiterStatus.retryAfter) {
    headers = {
      ...headers,
      "Retry-after": rateLimiterStatus.retryAfter
    };
  }

  if (rateLimiterStatus.rateLimitReset) {
    headers = {
      ...headers,
      "X-Rate-Limit-Reset": rateLimiterStatus.rateLimitReset
    };
  }
  return headers;
};
