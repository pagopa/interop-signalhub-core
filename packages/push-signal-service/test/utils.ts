import { setupTestContainersVitest } from "signalhub-commons-test";
import { afterEach, inject } from "vitest";

import { storeServiceBuilder } from "../src/services/store.service";

export const { cleanup, postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

afterEach(cleanup);

export const storeService = storeServiceBuilder();
