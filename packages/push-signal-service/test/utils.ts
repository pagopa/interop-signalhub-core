import { setupTestContainersVitest } from "signalhub-commons-test";
import { afterEach, inject } from "vitest";

import { quequeServiceBuilder } from "../src/services/queque.service.js";
import { storeServiceBuilder } from "../src/services/store.service";

export const { cleanup, postgresDB, sqsClient } = setupTestContainersVitest(
  inject("signalHubStoreConfig"),
  inject("sqsConfig")
);

afterEach(cleanup);

export const storeService = storeServiceBuilder(postgresDB);

export const quequeService = quequeServiceBuilder(sqsClient);
