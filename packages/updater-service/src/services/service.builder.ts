import { DB, createDbInstance } from "signalhub-commons";
import {
  TracingBatchService,
  tracingBatchServiceBuilder,
} from "./tracingBatch.service.js";
import { config } from "../config/env.js";
import {
  InteropClientService,
  interopClientServiceBuilder,
} from "./interopClient.service.js";

export function serviceBuilder(): {
  tracingBatchService: TracingBatchService;
  interopClientService: InteropClientService;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    schema: config.signalhubStoreDbSchema,
    useSSL: config.signalhubStoreDbUseSSL,
  });

  const tracingBatchService = tracingBatchServiceBuilder(db);
  const interopClientService = interopClientServiceBuilder();

  return { tracingBatchService, interopClientService };
}
