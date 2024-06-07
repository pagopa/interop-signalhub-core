import { setupTestContainersVitest } from "signalhub-commons-test";
import { afterEach, inject } from "vitest";
import { storeSignalServiceBuilder } from "../src/services/storeSignal.service.js";
import { DB, createDbInstance } from "signalhub-commons";

export const { cleanup, postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

afterEach(cleanup);

export const storeSignalService = storeSignalServiceBuilder(postgresDB);

export const wrongDB: DB = createDbInstance({
  username: "wrong",
  password: "wrong",
  host: "wrong",
  port: 65535,
  database: "wrong",
  schema: "wrong",
  useSSL: false,
});
export const wrongStoreSignalService = storeSignalServiceBuilder(wrongDB);
