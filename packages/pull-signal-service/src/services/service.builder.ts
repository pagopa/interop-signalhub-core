import { DB, createDbInstance } from "signalhub-commons";
import { config } from "../config/env.js";
import {
  InteropClientService,
  interopClientServiceBuilder,
} from "./interopClient.service.js";
import { storeServiceBuilder, StoreService } from "./store.service.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";
export function serviceBuilder(): {
  storeService: StoreService;
  interopClientService: InteropClientService;
  signalService: SignalService;
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
  const signalService = signalServiceBuilder(db);
  const storeService = storeServiceBuilder(db);
  const interopClientService = interopClientServiceBuilder();
  return {
    storeService,
    interopClientService,
    signalService,
  };
}
