import type {} from "vitest";
import { config as dotenv } from "dotenv-flow";
import type { GlobalSetupContext } from "vitest/node";
import {
  TEST_POSTGRES_DB_PORT,
  postgreSQLContainer,
} from "./containerTestUtils.js";
import { SignalHubStoreConfig } from "signalhub-commons";
import { StartedTestContainer } from "testcontainers";

declare module "vitest" {
  export interface ProvidedContext {
    signalHubStoreConfig: SignalHubStoreConfig;
    // Add SQS config
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

  return async function ({
    provide,
  }: GlobalSetupContext): Promise<() => Promise<void>> {
    let startedPostgreSqlContainer: StartedTestContainer | undefined;

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

    return async (): Promise<void> => {
      await startedPostgreSqlContainer?.stop();
    };
  };
}
