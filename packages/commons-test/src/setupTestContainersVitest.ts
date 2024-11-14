/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  DB,
  RateLimiter,
  RedisRateLimiterConfig,
  SQS,
  SignalHubStoreConfig,
  createDbInstance,
  initRedisRateLimiter
} from "pagopa-signalhub-commons";

import { SqsConfig, truncateSignalTable } from "./index.js";
/**
 * This function is a setup for vitest that initializes the postgres
 * database and returns their instances along with a cleanup function.
 * The cleanup function deletes all the data from the postgres database
 * and must be called at the end of each test (`afterEach`), to ensure that the tests are isolated.
 *
 * @param config The configuration object containing the connection parameters. It must be retrieved from the `config` object provided by the `setupTestContainersVitestGlobal` function with the vitest's `inject` function.
 *
 * @example
 * ```typescript
 * import { setupTestContainersVitest } from "pagopa-interop-commons-test";
 * import { inject, afterEach } from "vitest";
 *
 * export const { readModelRepository, postgresDB, fileManager, cleanup } =
 *   setupTestContainersVitest(inject("config"));
 *
 * afterEach(cleanup);
 * ```
 */

export async function setupTestContainersVitest(
  signalHubStoreConfig?: SignalHubStoreConfig
): Promise<{
  postgresDB: DB;
  cleanup: () => Promise<void>;
}>;

export async function setupTestContainersVitest(
  signalHubStoreConfig?: SignalHubStoreConfig,
  sqsConfig?: SqsConfig
): Promise<{
  postgresDB: DB;
  sqsClient: SQS.SQSClient;
  cleanup: () => Promise<void>;
}>;

export async function setupTestContainersVitest(
  signalHubStoreConfig?: SignalHubStoreConfig,
  sqsConfig?: SqsConfig,
  redisRateLimiterConfig?: RedisRateLimiterConfig
): Promise<{
  postgresDB?: DB;
  sqsClient?: SQS.SQSClient;
  redisRateLimiter?: RateLimiter;
  cleanup: () => Promise<void>;
}>;

export async function setupTestContainersVitest(
  signalHubStoreConfig?: SignalHubStoreConfig,
  sqsConfig?: SqsConfig,
  redisRateLimiterConfig?: RedisRateLimiterConfig
): Promise<{
  postgresDB?: DB;
  sqsClient?: SQS.SQSClient;
  redisRateLimiter?: RateLimiter;
  cleanup: () => Promise<void>;
}> {
  let postgresDB: DB | undefined;
  let sqsClient: SQS.SQSClient | undefined;
  let redisRateLimiter: RateLimiter | undefined;

  if (signalHubStoreConfig) {
    postgresDB = createDbInstance({
      username: signalHubStoreConfig.signalhubStoreDbUsername,
      password: signalHubStoreConfig.signalhubStoreDbPassword,
      host: signalHubStoreConfig.signalhubStoreDbHost,
      port: signalHubStoreConfig.signalhubStoreDbPort,
      database: signalHubStoreConfig.signalhubStoreDbName,
      useSSL: signalHubStoreConfig.signalhubStoreDbUseSSL,
      maxConnectionPool: signalHubStoreConfig.maxConnectionPool
    });
  }

  if (sqsConfig) {
    sqsClient = SQS.instantiateClient({ endpoint: sqsConfig.queueUrl });
  }

  if (redisRateLimiterConfig) {
    redisRateLimiter = await initRedisRateLimiter({
      limiterGroup: "TEST",
      maxRequests: redisRateLimiterConfig.rateLimiterMaxRequests,
      rateInterval: redisRateLimiterConfig.rateLimiterRateInterval,
      burstPercentage: redisRateLimiterConfig.rateLimiterBurstPercentage,
      redisHost: redisRateLimiterConfig.rateLimiterRedisHost,
      redisPort: redisRateLimiterConfig.rateLimiterRedisPort,
      timeout: redisRateLimiterConfig.rateLimiterTimeout
    });
  }

  return {
    postgresDB,
    sqsClient,
    redisRateLimiter,
    cleanup: async (): Promise<void> => {
      await truncateSignalTable(
        postgresDB!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        signalHubStoreConfig?.signalHubSchema!
      );
      // TODO: clean queque messages
    }
  };
}
