import { DB, Logger, createDbInstance } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { clockServiceBuilder } from "./clock.service.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";
import {
  TracingBatchCleanupService,
  tracingBatchServiceCleanupBuilder,
} from "./tracingBatchCleanup.service.js";

export async function serviceBuilder(logger: Logger): Promise<{
  db: DB;
  signalService: SignalService;
  tracingBatchCleanupService: TracingBatchCleanupService;
}> {
  const db: DB = createDbInstance({
    database: config.signalhubStoreDbName,
    host: config.signalhubStoreDbHost,
    maxConnectionPool: config.maxConnectionPool,
    password: config.signalhubStoreDbPassword,
    port: config.signalhubStoreDbPort,
    useSSL: config.signalhubStoreDbUseSSL,
    username: config.signalhubStoreDbUsername,
  });

  const clockService = clockServiceBuilder();
  const signalService = signalServiceBuilder(db, clockService, logger);

  const tracingBatchCleanupService = tracingBatchServiceCleanupBuilder(
    db,
    logger,
  );

  return {
    db,
    signalService,
    tracingBatchCleanupService,
  };
}
