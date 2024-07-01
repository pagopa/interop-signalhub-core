import { afterEach, inject } from "vitest";
import { setupTestContainersVitest } from "signalhub-commons-test";
import { logger } from "signalhub-commons";
import { tracingBatchServiceBuilder } from "../src/services/tracingBatch.service.js";
import { interopClientServiceBuilder } from "../src/services/interopClient.service.js";
import { producerServiceBuilder } from "../src/services/producerService.service.js";
import { producerEserviceRepository } from "../src/repositories/producerEservice.repository.js";
import { updaterBuilder } from "../src/updater.js";
import { consumerServiceBuilder } from "../src/services/consumer.service.js";
import { consumerEserviceRepository } from "../src/repositories/consumerEservice.repository.js";

export const { cleanup, postgresDB, interopClientConfig } =
  setupTestContainersVitest(
    inject("signalHubStoreConfig"),
    inject("sqsConfig"),
    inject("interopClientConfig")
  );

export const loggerInstance = logger({
  serviceName: "updater-test",
  correlationId: "",
});

afterEach(cleanup);
export const tracingBatchService = tracingBatchServiceBuilder(postgresDB);

export const interopClientService = interopClientServiceBuilder(
  "",
  loggerInstance
);

const producerEserviceRepositoryInstance =
  producerEserviceRepository(postgresDB);

const consumerEserviceRepositoryInstance =
  consumerEserviceRepository(postgresDB);

const producerEservice = producerServiceBuilder(
  producerEserviceRepositoryInstance,
  interopClientService,
  loggerInstance
);

const consumer = consumerServiceBuilder(
  consumerEserviceRepositoryInstance,
  interopClientService,
  producerEservice,
  loggerInstance
);

export const task = await updaterBuilder(
  tracingBatchService,
  interopClientService,
  consumer,
  producerEservice
);
