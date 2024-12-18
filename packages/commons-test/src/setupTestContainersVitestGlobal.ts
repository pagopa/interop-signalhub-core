import type {} from "vitest";
import type { GlobalSetupContext } from "vitest/node";

import { config as dotenv } from "dotenv-flow";
import {
  AwsConfig,
  QuequeConfig,
  RedisRateLimiterConfig,
  SignalHubStoreConfig
} from "pagopa-signalhub-commons";
import { StartedTestContainer } from "testcontainers";
import { z } from "zod";

import {
  TEST_ELASTIC_MQ_PORT,
  TEST_POSTGRES_DB_PORT,
  TEST_REDIS_PORT,
  elasticMQContainer,
  postgreSQLContainer,
  redisContainer
} from "./containerTestUtils.js";

const SqsConfig = QuequeConfig.and(AwsConfig);
export type SqsConfig = z.infer<typeof SqsConfig>;

declare module "vitest" {
  export interface ProvidedContext {
    redisRateLimiterConfig?: RedisRateLimiterConfig;
    signalHubStoreConfig: SignalHubStoreConfig;
    sqsConfig: SqsConfig;
  }
}

/**
 * This function is a global setup for vitest that starts and stops test containers for PostgreSQL
 * It must be called in a file that is used as a global setup in the vitest configuration.
 *
 * It provides the `config` object to the tests, via the `provide` function.
 *
 * @see https://vitest.dev/config/#globalsetup).
 */
export function setupTestContainersVitestGlobal() {
  dotenv();

  const signalHubStoreConfig = SignalHubStoreConfig.safeParse(process.env);
  const sqsConfig = SqsConfig.safeParse(process.env);
  const redisRateLimiterConfig = RedisRateLimiterConfig.safeParse(process.env);

  return async function ({
    provide
  }: GlobalSetupContext): Promise<() => Promise<void>> {
    let startedPostgreSqlContainer: StartedTestContainer | undefined;
    let startedElasticMQContainer: StartedTestContainer | undefined;
    let startedRedisContainer: StartedTestContainer | undefined;

    if (signalHubStoreConfig.success) {
      startedPostgreSqlContainer = await postgreSQLContainer(
        signalHubStoreConfig.data
      ).start();

      /**
       * Since testcontainers exposes to the host on a random port, in order to avoid port
       * collisions, we need to get the port through `getMappedPort` to connect to the databases.
       *
       * @see https://node.testcontainers.org/features/containers/#exposing-container-ports
       *
       * The comment applies to the other containers setup after this one as well.
       */
      signalHubStoreConfig.data.signalhubStoreDbPort =
        startedPostgreSqlContainer.getMappedPort(TEST_POSTGRES_DB_PORT);

      /**
       * Vitest global setup functions are executed in a separate process, vitest provides a way to
       * pass serializable data to the tests via the `provide` function.
       * In this case, we provide the `config` object to the tests, so that they can connect to the
       * started containers.
       *
       * The comment applies to the other containers setup after this one as well.
       */
      provide("signalHubStoreConfig", signalHubStoreConfig.data);
    }

    if (sqsConfig.success) {
      startedElasticMQContainer = await elasticMQContainer().start();

      sqsConfig.data.queueUrl = `http://localhost:${startedElasticMQContainer.getMappedPort(
        TEST_ELASTIC_MQ_PORT
      )}/000000000000/sqsLocalQueue`;

      provide("sqsConfig", sqsConfig.data);
    }

    if (redisRateLimiterConfig.success) {
      startedRedisContainer = await redisContainer().start();
      redisRateLimiterConfig.data.rateLimiterRedisPort =
        startedRedisContainer.getMappedPort(TEST_REDIS_PORT);

      provide("redisRateLimiterConfig", redisRateLimiterConfig.data);
    }
    return async (): Promise<void> => {
      // eslint-disable-next-line no-console
      console.info("Stopping test containers");
      await startedPostgreSqlContainer?.stop();
      await startedElasticMQContainer?.stop();
    };
  };
}
