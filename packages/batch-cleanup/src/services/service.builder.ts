import { DB, createDbInstance, Logger } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";
import { clockServiceBuilder } from "./clock.service.js";

export async function serviceBuilder(logger: Logger): Promise<{
  signalService: SignalService;
  db: DB;
}> {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
  });

  const clockService = clockServiceBuilder();
  const signalService = signalServiceBuilder(db, clockService, logger);

  return {
    db,
    signalService,
  };
}
