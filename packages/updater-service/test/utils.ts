import { afterEach, inject, vi } from "vitest";
import {
  setupTestContainersVitest,
  truncateTracingBatchTable,
} from "signalhub-commons-test";
import { tracingBatchServiceBuilder } from "../src/services/tracingBatch.service.js";
import { interopClientServiceBuilder } from "../src/services/interopClient.service.js";
import { logger } from "signalhub-commons";
export const { cleanup, postgresDB, interopClientConfig } =
  setupTestContainersVitest(
    inject("signalHubStoreConfig"),
    inject("sqsConfig"),
    inject("interopClientConfig")
  );

const loggerInstance = logger({
  serviceName: "updater test",
  correlationId: "",
});

afterEach(cleanup);
afterEach(() => truncateTracingBatchTable(postgresDB));

export const tracingBatchService = tracingBatchServiceBuilder(postgresDB);

const accessToken = "";
export const interopClientService = interopClientServiceBuilder(
  accessToken,
  loggerInstance
);
