import { afterEach, inject } from "vitest";
import {
  setupTestContainersVitest,
  truncateTracingBatchTable,
} from "signalhub-commons-test";
import { logger } from "signalhub-commons";
import { tracingBatchServiceBuilder } from "../src/services/tracingBatch.service.js";
import { interopClientServiceBuilder } from "../src/services/interopClient.service.js";
import { producerServiceBuilder } from "../src/services/producerService.service.js";

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

export const producerEservice = producerServiceBuilder(
  postgresDB,
  interopClientService,
  loggerInstance
);
