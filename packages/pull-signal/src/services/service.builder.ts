import { DB, createDbInstance } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { InteropService, interopServiceBuilder } from "./interop.service.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";
export function serviceBuilder(): {
  interopService: InteropService;
  signalService: SignalService;
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
  const signalService = signalServiceBuilder(db);
  const interopService = interopServiceBuilder(db);
  return {
    interopService,
    signalService,
  };
}
