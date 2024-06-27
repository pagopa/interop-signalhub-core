import { afterEach, inject } from "vitest";
import {
  setupTestContainersVitest,
  truncateTracingBatchTable,
} from "signalhub-commons-test";
import { logger } from "signalhub-commons";
import { tracingBatchServiceBuilder } from "../src/services/tracingBatch.service.js";
import { interopClientServiceBuilder } from "../src/services/interopClient.service.js";
import { producerServiceBuilder } from "../src/services/producerService.service.js";
import { producerEserviceRepository } from "../src/repositories/producerEservice.repository.js";

export const { cleanup, postgresDB, interopClientConfig } =
  setupTestContainersVitest(
    inject("signalHubStoreConfig"),
    inject("sqsConfig"),
    inject("interopClientConfig")
  );

export const loggerInstance = logger({
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

const producerEserviceRepositoryInstance =
  producerEserviceRepository(postgresDB);

export const producerEservice = producerServiceBuilder(
  producerEserviceRepositoryInstance,
  interopClientService,
  loggerInstance
);
