import { DB, createDbInstance, logger } from "signalhub-commons";
import {
  TracingBatchService,
  tracingBatchServiceBuilder,
} from "./tracingBatch.service.js";
import { config } from "../config/env.js";
import {
  InteropClientService,
  interopClientServiceBuilder,
} from "./interopClient.service.js";
import { ConsumerService, consumerServiceBuilder } from "./consumer.service.js";
import { getAccessToken } from "signalhub-interop-client";

export async function serviceBuilder(): Promise<{
  tracingBatchService: TracingBatchService;
  interopClientService: InteropClientService;
  consumerService: ConsumerService;
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
    schema: config.signalhubStoreDbSchema,
    useSSL: config.signalhubStoreDbUseSSL,
  });

  const accessToken = await getAccessToken();

  const tracingBatchService = tracingBatchServiceBuilder(db);
  const interopClientService = interopClientServiceBuilder(
    accessToken,
    loggerInstance
  );

  const consumerService = consumerServiceBuilder(
    db,
    interopClientService,
    loggerInstance
  );

  return { tracingBatchService, interopClientService, consumerService };
}
