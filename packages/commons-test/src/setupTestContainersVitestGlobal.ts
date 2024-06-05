import type {} from "vitest";
import { config as dotenv } from "dotenv-flow";
import type { GlobalSetupContext } from "vitest/node";
import {
  TEST_POSTGRES_DB_PORT,
  TEST_SQS_PORT,
  postgreSQLContainer,
  sqsContainer,
} from "./containerTestUtils.js";
import {
  QuequeConfig,
  SignalHubStoreConfig,
  AwsConfig,
} from "signalhub-commons";
import { StartedTestContainer } from "testcontainers";
import { z } from "zod";

const SqsConfig = QuequeConfig.and(AwsConfig);

export type SqsConfig = z.infer<typeof SqsConfig>;

declare module "vitest" {
  export interface ProvidedContext {
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

  return async function ({
    provide,
  }: GlobalSetupContext): Promise<() => Promise<void>> {
    let startedPostgreSqlContainer: StartedTestContainer | undefined;
    let startedSqContainer: StartedTestContainer | undefined;

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
      startedSqContainer = await sqsContainer(sqsConfig.data).start();
      startedSqContainer.exec([
        "aws",
        "sqs",
        "create-queue",
        "--queue-name",
        `${sqsConfig.data.queueName}`,
        "--endpoint-url",
        `${sqsConfig.data.queueEndpoint}`,
      ]);

      sqsConfig.data.queuePort =
        startedSqContainer?.getMappedPort(TEST_SQS_PORT);

      sqsConfig.data.queueEndpoint = `http://localhost:${sqsConfig.data.queuePort}`;

      provide("sqsConfig", sqsConfig.data);
    }

    return async (): Promise<void> => {
      console.info("Stopping test containers");
      await startedPostgreSqlContainer?.stop();
      await startedSqContainer?.stop();
    };
  };
}
