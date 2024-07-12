import { afterEach, inject } from "vitest";
import { DB, createDbInstance, genericLogger } from "pagopa-signalhub-commons";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { storeSignalServiceBuilder } from "../src/services/storeSignal.service.js";
import { processMessage } from "../src/messageHandler.js";

export const { cleanup, postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

afterEach(cleanup);

export const storeSignalService = storeSignalServiceBuilder(
  postgresDB,
  genericLogger
);
export const processMessageHandler = processMessage(
  storeSignalService,
  genericLogger
);

export const wrongDB: DB = createDbInstance({
  username: "wrong",
  password: "wrong",
  host: "wrong",
  port: 65535,
  database: "wrong",
  useSSL: false,
});
export const wrongStoreSignalService = storeSignalServiceBuilder(
  wrongDB,
  genericLogger
);
