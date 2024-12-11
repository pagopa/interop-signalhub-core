import { DB, createDbInstance } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { delegationRepository } from "../repositories/delegation.repository.js";
import {
  IDelegationService,
  delegationServiceBuilder
} from "./delegation.service.js";

export function serviceBuilder(): {
  delegationService: IDelegationService;
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

  const delegationRepositoryInstance = delegationRepository(db);

  const delegationService = delegationServiceBuilder(
    delegationRepositoryInstance
  );

  return { delegationService };
}
