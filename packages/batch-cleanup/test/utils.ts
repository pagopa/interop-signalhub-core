import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { inject } from "vitest";

import { genericLogger } from "pagopa-signalhub-commons";
import { signalServiceBuilder } from "../src/services/signal.service.js";
import { clockServiceBuilder } from "../src/services/clock.service.js";

export const { cleanup, postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const clockService = clockServiceBuilder();
export const signalService = signalServiceBuilder(
  postgresDB,
  clockService,
  genericLogger
);

export const ONE_HOUR = 60 * 60 * 1000; /* ms */
export const ONE_MINUTE = 60 * 1000; /* ms */
