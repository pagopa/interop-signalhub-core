import { setupTestContainersVitest } from "signalhub-commons-test";
import { inject } from "vitest";

import { genericLogger } from "signalhub-commons";
import { signalServiceBuilder } from "../src/services/signal.service.js";

export const { cleanup, postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const signalService = signalServiceBuilder(postgresDB, genericLogger);
