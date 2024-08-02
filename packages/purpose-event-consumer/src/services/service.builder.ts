import { DB, createDbInstance } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";
import { purposeRepository } from "../repositories/purpose.repository.js";
import { PurposeService, purposeServiceBuilder } from "./purpose.service.js";
export function serviceBuilder(): {
  purposeService: PurposeService;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
  });

  const purposeRepositoryInstance = purposeRepository(db);
  const purposeService = purposeServiceBuilder(purposeRepositoryInstance);

  return {
    purposeService,
  };
}
