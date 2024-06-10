import { config } from "../config/env.js";
import { storeServiceBuilder, StoreService } from "./store.service.js";
import { DB, createDbInstance } from "signalhub-commons";
export function serviceBuilder(): {
  storeService: StoreService;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    schema: config.signalhubStoreDbSchema,
    useSSL: config.signalhubStoreDbUseSSL,
  });
  const storeService = storeServiceBuilder(db);

  return {
    storeService,
  };
}
