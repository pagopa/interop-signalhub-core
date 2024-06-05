import { setupTestContainersVitest } from "signalhub-commons-test";
import { afterEach, inject } from "vitest";

export const { cleanup, postgresDB, sqsClient } = setupTestContainersVitest(
  inject("signalHubStoreConfig"),
  inject("sqsConfig")
);

afterEach(cleanup);
