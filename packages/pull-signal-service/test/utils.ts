import { setupTestContainersVitest } from "signalhub-commons-test";
import { afterEach, inject } from "vitest";
import { signalServiceBuilder } from "../src/services/signal.service";
import { storeServiceBuilder } from "../src/services/store.service";

export const { cleanup, postgresDB, sqsClient } = setupTestContainersVitest(
  inject("signalHubStoreConfig"),
  inject("sqsConfig")
);

afterEach(cleanup);

export const storeService = storeServiceBuilder(postgresDB);
export const signalService = signalServiceBuilder(postgresDB);
