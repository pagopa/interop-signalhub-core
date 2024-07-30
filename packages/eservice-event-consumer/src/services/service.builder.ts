import { DB, createDbInstance } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";
import { EServiceService, eServiceServiceBuilder } from "./eservice.service.js";
import { eServiceRepository } from "../repositories/eservice.repository.js";

export function serviceBuilder(): {
  eServiceService: EServiceService;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
  });

  // Repository //
  const eServiceRepositoryInstance = eServiceRepository(db);

  // Service //
  const eServiceService = eServiceServiceBuilder(eServiceRepositoryInstance);

  return { eServiceService };
}
