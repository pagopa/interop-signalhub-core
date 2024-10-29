import { DB, createDbInstance } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { agreementRepository } from "../repositories/index.js";
import {
  AgreementService,
  agreementServiceBuilder,
} from "./agreement.service.js";
export function serviceBuilder(): {
  agreementService: AgreementService;
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

  const agreementRepositoryInstance = agreementRepository(db);
  const agreementService = agreementServiceBuilder(agreementRepositoryInstance);

  return {
    agreementService,
  };
}
