import { afterEach, inject, vi } from "vitest";
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

export const spyFindEservice = vi
  .spyOn(
    producerEserviceRepository(postgresDB),
    "findByEserviceIdAndProducerIdAndDescriptorId"
  )
  .mockResolvedValue(1 as any);

export const producerEservice = producerServiceBuilder(
  postgresDB,
  interopClientService,
  loggerInstance
);
