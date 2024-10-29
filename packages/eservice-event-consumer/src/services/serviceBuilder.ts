import { DB, createDbInstance } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { eServiceProducerRepository } from "../repositories/eServiceProducer.repository.js";
import { eServiceRepository } from "../repositories/eservice.repository.js";
import { EServiceService, eServiceServiceBuilder } from "./eservice.service.js";

export function serviceBuilder(): {
  eServiceService: EServiceService;
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

  // Repository //
  const eServiceRepositoryInstance = eServiceRepository(db);
  const eServiceProducerRepositoryInstance = eServiceProducerRepository(db);

  // Service //
  const eServiceService = eServiceServiceBuilder(
    eServiceRepositoryInstance,
    eServiceProducerRepositoryInstance,
  );

  return { eServiceService };
}
