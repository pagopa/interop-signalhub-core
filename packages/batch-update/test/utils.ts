import { afterEach, inject } from "vitest";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { logger } from "pagopa-signalhub-commons";
import { tracingBatchServiceBuilder } from "../src/services/tracingBatch.service.js";
import { interopClientServiceBuilder } from "../src/services/interopClient.service.js";
import { producerServiceBuilder } from "../src/services/producerService.service.js";
import {
  producerEserviceRepository,
  agreementRepository,
} from "../src/repositories/index.js";
import { updaterBuilder } from "../src/updater.js";
import { DeadEventService } from "../src/services/deadEvent.service.js";
import { agreementServiceBuilder } from "../src/services/agreement.service.js";

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

const agreementRepositoryInstance = agreementRepository(postgresDB);

const producerEservice = producerServiceBuilder(
  producerEserviceRepositoryInstance,
  interopClientService,
  loggerInstance
);

const agreementService = agreementServiceBuilder(
  agreementRepositoryInstance,
  interopClientService,
  producerEservice,
  loggerInstance
);

export const task = await updaterBuilder(
  tracingBatchService,
  interopClientService,
  agreementService,
  producerEservice,
  {} as DeadEventService
);
