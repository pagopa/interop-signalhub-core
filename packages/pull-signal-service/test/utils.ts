import { setupTestContainersVitest } from "signalhub-commons-test";
import { afterEach, inject } from "vitest";
import { signalServiceBuilder } from "../src/services/signal.service";
import { interopServiceBuilder } from "../src/services/interop.service";
import { interopApiClientServiceBuilder } from "../src/services/interopApiClient.service";

export const { cleanup, postgresDB, sqsClient } = setupTestContainersVitest(
  inject("signalHubStoreConfig"),
  inject("sqsConfig")
);

afterEach(cleanup);

export const storeService = interopServiceBuilder(
  postgresDB,
  interopApiClientServiceBuilder()
);
export const signalService = signalServiceBuilder(postgresDB);
