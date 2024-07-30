import { DB, createDbInstance } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export function serviceBuilder(): {} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
  });

  //   const agreementRepositoryInstance = agreementRepository(db);
  //   const agreementService = agreementServiceBuilder(agreementRepositoryInstance);

  return { db };
}
