import {
  createDbInstance,
  DB,
  initFileManager,
  Logger
} from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { DatalakeService, datalakeServiceBuilder } from "./datalake.service.js";

export function serviceBuilder(logger: Logger): {
  datalakeService: DatalakeService;
  db: DB;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
    maxConnectionPool: config.maxConnectionPool
  });

  const fileManager = initFileManager(config);
  const datalakeService = datalakeServiceBuilder(db, fileManager, logger);

  return {
    db,
    datalakeService
  };
}
