import { DB, createDbInstance } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";
import { interopApiClientServiceBuilder } from "./interopApiClient.service.js";
import { interopServiceBuilder, InteropService } from "./interop.service.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";
export function serviceBuilder(): {
  signalService: SignalService;
  interopService: InteropService;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
  });
  const signalService = signalServiceBuilder(db);
  const interopService = interopServiceBuilder(
    db,
    interopApiClientServiceBuilder()
  );
  return {
    signalService,
    interopService,
  };
}
