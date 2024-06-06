import { setupTestContainersVitest } from "signalhub-commons-test";
import { afterEach, inject } from "vitest";

export const { cleanup, postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

afterEach(cleanup);
