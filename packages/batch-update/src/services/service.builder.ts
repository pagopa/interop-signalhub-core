import { DB, createDbInstance, logger } from "pagopa-signalhub-commons";
import { getAccessToken } from "pagopa-signalhub-interop-client";
import { config } from "../config/env.js";
import {
  producerEserviceRepository,
  agreementRepository,
  deadEventRepository,
} from "../repositories/index.js";

import {
  ProducerService,
  producerServiceBuilder,
  AgreementService,
  agreementServiceBuilder,
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
  agreementService: AgreementService;
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
  const agreementRepositoryInstance = agreementRepository(db);
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

  const agreementService = agreementServiceBuilder(
    agreementRepositoryInstance,
    interopClientService,
    producerService,
    loggerInstance
  );

  return {
    deadEventService,
    tracingBatchService,
    interopClientService,
    agreementService,
    producerService,
  };
}
