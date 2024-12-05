import { describe, expect, it } from "vitest";

import { genericLogger } from "../../commons/dist/logging/index.js";
import { redisRateLimiter } from "./utils.js";

async function consumeRateLimiterRequest(organizationId: string) {
  return await redisRateLimiter?.rateLimitBy(organizationId, genericLogger);
}

async function getRequestConsumedBy(organizationId: string) {
  return await redisRateLimiter?.getRateLimitCountBy(organizationId);
}

function getBurstRequestConsumedFor(organizationId: string) {
  return redisRateLimiter?.getRateLimitBurstCountBy(organizationId);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
  ---------- NOTE ------------------------------------
  Test rate limiter configuration defined in .env.test
  ----------------------------------------------------
  */

/**
 * @description This test allow to test if application rate-limiter which use BurstyRateLimiter alghoritms
 * works as we expected.
 * For this scope on redisRateLimiter we define two methods for retrieveing info from Redis memory (getRateLimitBurstcountBy and getRequestConsumedFor)

*/

// eslint-disable-next-line vitest/valid-describe-callback
describe("Redis rate limiter tests", async () => {
  it("should rate-limit follow BurstRateLimiter logic", async () => {
    const organizationId = "organization-test-id-2";

    // At the begenning we expect that requests consumed (if no one has invoked rateLimiter) are 0.
    await expect(getRequestConsumedBy(organizationId)).resolves.toBe(0);

    await expect(consumeRateLimiterRequest(organizationId)).resolves.toEqual(
      expect.objectContaining({
        limitReached: false,
        maxRequests: 2,
        rateInterval: 1000,
        remainingRequests: 1,
        rateLimitReset: expect.any(Number)
      })
    );

    await expect(getRequestConsumedBy(organizationId)).resolves.toBe(1);

    await expect(consumeRateLimiterRequest(organizationId)).resolves.toEqual(
      expect.objectContaining({
        limitReached: false,
        maxRequests: 2,
        rateInterval: 1000,
        remainingRequests: 0,
        rateLimitReset: expect.any(Number)
      })
    );

    await expect(getRequestConsumedBy(organizationId)).resolves.toBe(2);

    // Burst rate limiter kicks in.
    // Burst percentage in config is 1.5, so we expect 3 requests to be allowed.

    await expect(consumeRateLimiterRequest(organizationId)).resolves.toEqual(
      expect.objectContaining({
        limitReached: false,
        maxRequests: 2,
        rateInterval: 1000,
        remainingRequests: 0,
        rateLimitReset: expect.any(Number)
      })
    );

    await expect(getBurstRequestConsumedFor(organizationId)).resolves.toBe(1);

    await expect(consumeRateLimiterRequest(organizationId)).resolves.toEqual(
      expect.objectContaining({
        limitReached: false,
        maxRequests: 2,
        rateInterval: 1000,
        remainingRequests: 0,
        rateLimitReset: expect.any(Number)
      })
    );

    await expect(getBurstRequestConsumedFor(organizationId)).resolves.toBe(2);

    await expect(consumeRateLimiterRequest(organizationId)).resolves.toEqual(
      expect.objectContaining({
        limitReached: false,
        maxRequests: 2,
        rateInterval: 1000,
        remainingRequests: 0,
        rateLimitReset: expect.any(Number)
      })
    );

    await expect(getBurstRequestConsumedFor(organizationId)).resolves.toBe(3);

    // Limit reached
    await expect(consumeRateLimiterRequest(organizationId)).resolves.toEqual(
      expect.objectContaining({
        limitReached: true,
        maxRequests: 2,
        rateInterval: 1000,
        remainingRequests: 0,
        rateLimitReset: expect.any(Number),
        retryAfter: expect.any(Number)
      })
    );
  });

  it("should rate-limit reset requestsCount after rate interval", async () => {
    const organizationId = "orgazation-test-id";

    await expect(getRequestConsumedBy(organizationId)).resolves.toBe(0);

    await expect(consumeRateLimiterRequest(organizationId)).resolves.toEqual(
      expect.objectContaining({
        limitReached: false,
        maxRequests: 2,
        rateInterval: 1000,
        remainingRequests: 1,
        rateLimitReset: expect.any(Number)
      })
    );

    await expect(getRequestConsumedBy(organizationId)).resolves.toBe(1);

    await sleep(1000);

    await expect(consumeRateLimiterRequest(organizationId)).resolves.toEqual(
      expect.objectContaining({
        limitReached: false,
        maxRequests: 2,
        rateInterval: 1000,
        remainingRequests: 1,
        rateLimitReset: expect.any(Number)
      })
    );

    await expect(getRequestConsumedBy(organizationId)).resolves.toBe(1);
  });
});
