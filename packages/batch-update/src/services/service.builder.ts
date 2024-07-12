import { DB, createDbInstance, logger } from "pagopa-signalhub-commons";
import { getAccessToken } from "pagopa-signalhub-interop-client";
import { config } from "../config/env.js";
import {
  producerEserviceRepository,
  consumerEserviceRepository,
  deadEventRepository,
} from "../repositories/index.js";

import {
  ProducerService,
  producerServiceBuilder,
  ConsumerService,
  consumerServiceBuilder,
  deadServiceBuilder,
  DeadEventService,
  InteropClientService,
  interopClientServiceBuilder,
  TracingBatchService,
  tracingBatchServiceBuilder,
} from "./index.js";

export async function serviceBuilder(): Promise<{
  tracingBatchService: TracingBatchService;
  interopClientService: InteropClientService;
  consumerService: ConsumerService;
  producerService: ProducerService;
  deadEventService: DeadEventService;
}> {
  const loggerInstance = logger({
    serviceName: "batch-update",
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

  const tracingBatchService = tracingBatchServiceBuilder(db);

  const deadEventService = deadServiceBuilder(
    deadEventRepositoryInstance,
    tracingBatchService,
    loggerInstance
  );

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
