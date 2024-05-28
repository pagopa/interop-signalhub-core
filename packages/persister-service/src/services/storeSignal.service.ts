import { SignalEvent } from "../models/domain/models.js";
import { config } from "../config/index.js";
import { DB, createDbInstance } from "../repositories/db.js";
import { toSignal } from "../models/domain/toSignal.js";
import { signalRepository } from "../repositories/signal.repository.js";
import { logger } from "signalhub-commons";

const loggerInstance = logger({});
const db: DB = createDbInstance({
  username: config.signalhubStoreDbUsername,
  password: config.signalhubStoreDbPassword,
  host: config.signalhubStoreDbHost,
  port: config.signalhubStoreDbPort,
  database: config.signalhubStoreDbName,
  schema: config.signalhubStoreDbSchema,
  useSSL: config.signalhubStoreDbUseSSL,
});

export function storeSignalServiceBuilder() {
  return {
    async storeSignal(signalEvent: SignalEvent) {
      try {
        const signalrepository = signalRepository(db);

        const signal = toSignal(signalEvent, "correlation-id-to-replace");
        const id = await signalrepository.insertSignal(signal);
        loggerInstance.info(`Signal with id: ${id} has been inserted on DB`);
      } catch (error) {
        console.error(error);
      }
    },
  };
}
