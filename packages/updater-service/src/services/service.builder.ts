import { DB, createDbInstance, logger } from "signalhub-commons";
import { getAccessToken } from "signalhub-interop-client";
import { config } from "../config/env.js";
import { producerEserviceRepository } from "../repositories/producerEservice.repository.js";

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

export async function serviceBuilder(): Promise<{
  tracingBatchService: TracingBatchService;
  interopClientService: InteropClientService;
  consumerService: ConsumerService;
  producerService: ProducerService;
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

  const tracingBatchService = tracingBatchServiceBuilder(db);
  const interopClientService = interopClientServiceBuilder(
    accessToken,
    loggerInstance
  );

  const producerEserviceRepositoryInstance = producerEserviceRepository(db);

  const producerService = producerServiceBuilder(
    producerEserviceRepositoryInstance,
    interopClientService,
    loggerInstance
  );

  const consumerService = consumerServiceBuilder(
    db,
    interopClientService,
    producerService,
    loggerInstance
  );

  return {
    tracingBatchService,
    interopClientService,
    consumerService,
    producerService,
  };
}
