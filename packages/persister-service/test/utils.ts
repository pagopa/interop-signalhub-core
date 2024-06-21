import { afterEach, inject } from "vitest";
import { DB, createDbInstance } from "signalhub-commons";
import { setupTestContainersVitest } from "signalhub-commons-test";
import { storeSignalServiceBuilder } from "../src/services/storeSignal.service.js";
import { processMessage } from "../src/messageHandler.js";

export const { cleanup, postgresDB } = setupTestContainersVitest(
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
});
export const wrongStoreSignalService = storeSignalServiceBuilder(wrongDB);
