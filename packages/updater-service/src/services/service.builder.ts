import { DB, createDbInstance, logger } from "signalhub-commons";
import { getAccessToken } from "signalhub-interop-client";

import {
  producerEserviceRepository,
  consumerEserviceRepository,
  deadEventRepository,
} from "../repositories/index.js";
import { config } from "../config/env.js";
import {
  TracingBatchService,
  tracingBatchServiceBuilder,
} from "./tracingBatch.service.js";
import {
  InteropClientService,
  interopClientServiceBuilder,
} from "./interopClient.service.js";
import { ConsumerService, consumerServiceBuilder } from "./consumer.service.js";
import {
  ProducerService,
  producerServiceBuilder,
} from "./producerService.service.js";
import { deadServiceBuilder, DeadEventService } from "./deadEvent.service.js";

export async function serviceBuilder(): Promise<{
  tracingBatchService: TracingBatchService;
  interopClientService: InteropClientService;
  consumerService: ConsumerService;
  producerService: ProducerService;
  deadEventService: DeadEventService;
}> {
  const loggerInstance = logger({
    serviceName: "updater-service",
  });

  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
  });

  const accessToken = await getAccessToken();

  // -- Repositories -- //
  const producerEserviceRepositoryInstance = producerEserviceRepository(db);
  const consumerEserviceRepositoryInstance = consumerEserviceRepository(db);
  const deadEventRepositoryInstance = deadEventRepository(db);

  // -- Services -- //

  const deadEventService = deadServiceBuilder(
    deadEventRepositoryInstance,
    loggerInstance
  );

  const tracingBatchService = tracingBatchServiceBuilder(db);
  const interopClientService = interopClientServiceBuilder(
    accessToken,
    loggerInstance
  );

  const producerService = producerServiceBuilder(
    producerEserviceRepositoryInstance,
    interopClientService,
    loggerInstance
  );

  const consumerService = consumerServiceBuilder(
    consumerEserviceRepositoryInstance,
    interopClientService,
    producerService,
    loggerInstance
  );

  return {
    deadEventService,
    tracingBatchService,
    interopClientService,
    consumerService,
    producerService,
  };
}
