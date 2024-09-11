import { DB, createDbInstance } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";
import { eServiceRepository } from "../repositories/eservice.repository.js";
import { eServiceProducerRepository } from "../repositories/eServiceProducer.repository.js";
import { EServiceService, eServiceServiceBuilder } from "./eservice.service.js";

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
    maxConnectionPool: config.maxConnectionPool,
  });

  // Repository //
  const eServiceRepositoryInstance = eServiceRepository(db);
  const eServiceProducerRepositoryInstance = eServiceProducerRepository(db);

  // Service //
  const eServiceService = eServiceServiceBuilder(
    eServiceRepositoryInstance,
    eServiceProducerRepositoryInstance
  );

  return { eServiceService };
}
