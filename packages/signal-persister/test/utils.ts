import { DB, createDbInstance } from "pagopa-signalhub-commons";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { afterEach, inject } from "vitest";

import { processMessage } from "../src/messageHandler.js";
import { storeSignalServiceBuilder } from "../src/services/storeSignal.service.js";

export const { cleanup, postgresDB } = await setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

afterEach(cleanup);

export const storeSignalService = storeSignalServiceBuilder(postgresDB);
export const processMessageHandler = processMessage(storeSignalService);

export const wrongDB: DB = createDbInstance({
  username: "wrong",
  password: "wrong",
  host: "wrong",
  port: 65535,
  database: "wrong",
  useSSL: false,
  maxConnectionPool: 5
});
export const wrongStoreSignalService = storeSignalServiceBuilder(wrongDB);
