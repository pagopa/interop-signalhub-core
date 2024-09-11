import { DB, createDbInstance, Logger } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";
import {
  TracingBatchCleanupService,
  tracingBatchServiceCleanupBuilder,
} from "./tracingBatchCleanup.service.js";
import { clockServiceBuilder } from "./clock.service.js";

export async function serviceBuilder(logger: Logger): Promise<{
  signalService: SignalService;
  tracingBatchCleanupService: TracingBatchCleanupService;
  db: DB;
}> {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
    maxConnectionPool: config.maxConnectionPool,
  });

  const clockService = clockServiceBuilder();
  const signalService = signalServiceBuilder(db, clockService, logger);

  const tracingBatchCleanupService = tracingBatchServiceCleanupBuilder(
    db,
    logger
  );

  return {
    db,
    signalService,
    tracingBatchCleanupService,
  };
}
