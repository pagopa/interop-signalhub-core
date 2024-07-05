import { DB, createDbInstance, Logger } from "signalhub-commons";
import { config } from "../config/env.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";

export async function serviceBuilder(logger: Logger): Promise<{
  signalService: SignalService;
}> {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
  });

  const signalService = signalServiceBuilder(db, logger);

  return {
    signalService,
  };
}
