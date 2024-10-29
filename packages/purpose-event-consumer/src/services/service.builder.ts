import { DB, createDbInstance } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { purposeRepository } from "../repositories/purpose.repository.js";
import { PurposeService, purposeServiceBuilder } from "./purpose.service.js";
export function serviceBuilder(): {
  purposeService: PurposeService;
} {
  const db: DB = createDbInstance({
    database: config.signalhubStoreDbName,
    host: config.signalhubStoreDbHost,
    maxConnectionPool: config.maxConnectionPool,
    password: config.signalhubStoreDbPassword,
    port: config.signalhubStoreDbPort,
    useSSL: config.signalhubStoreDbUseSSL,
    username: config.signalhubStoreDbUsername,
  });

  const purposeRepositoryInstance = purposeRepository(db);
  const purposeService = purposeServiceBuilder(purposeRepositoryInstance);

  return {
    purposeService,
  };
}
