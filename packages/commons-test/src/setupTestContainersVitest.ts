/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable functional/no-let */
/* eslint-disable functional/immutable-data */

import {
  DB,
  SQS,
  SignalHubStoreConfig,
  createDbInstance,
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

export function setupTestContainersVitest(
  signalHubStoreConfig?: SignalHubStoreConfig
): {
  postgresDB: DB;
  cleanup: () => Promise<void>;
};

export function setupTestContainersVitest(
  signalHubStoreConfig?: SignalHubStoreConfig,
  sqsConfig?: SqsConfig
): {
  postgresDB: DB;
  sqsClient: SQS.SQSClient;
  cleanup: () => Promise<void>;
};

export function setupTestContainersVitest(
  signalHubStoreConfig?: SignalHubStoreConfig,
  sqsConfig?: SqsConfig
): {
  postgresDB: DB;
  sqsClient: SQS.SQSClient;
  cleanup: () => Promise<void>;
};

export function setupTestContainersVitest(
  signalHubStoreConfig?: SignalHubStoreConfig,
  sqsConfig?: SqsConfig
): {
  postgresDB?: DB;
  sqsClient?: SQS.SQSClient;
  cleanup: () => Promise<void>;
} {
  let postgresDB: DB | undefined;
  let sqsClient: SQS.SQSClient | undefined;

  if (signalHubStoreConfig) {
    postgresDB = createDbInstance({
      username: signalHubStoreConfig.signalhubStoreDbUsername,
      password: signalHubStoreConfig.signalhubStoreDbPassword,
      host: signalHubStoreConfig.signalhubStoreDbHost,
      port: signalHubStoreConfig.signalhubStoreDbPort,
      database: signalHubStoreConfig.signalhubStoreDbName,
      useSSL: signalHubStoreConfig.signalhubStoreDbUseSSL,
      maxConnectionPool: signalHubStoreConfig.maxConnectionPool,
    });
  }

  if (sqsConfig) {
    sqsClient = SQS.instantiateClient({ endpoint: sqsConfig.queueUrl });
  }

  return {
    postgresDB,
    sqsClient,
    cleanup: async (): Promise<void> => {
      await truncateSignalTable(
        postgresDB!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        signalHubStoreConfig?.signalHubSchema!
      );
      // TODO: clean queque messages
    },
  };
}
