import { config } from "../config/index.js";
import { DB, createDbInstance } from "../repositories/db.js";
import { toSignal } from "../models/domain/toSignal.js";
import { signalRepository } from "../repositories/signal.repository.js";
import { logger, SignalMessage } from "signalhub-commons";
import { deadSignalRepository } from "../repositories/deadSignal.repository.js";
import { DeadSignal } from "../models/domain/model.js";
import {
  NotRecoverableMessageError,
  notRecoverableMessageError,
  recoverableMessageError,
} from "../models/domain/errors.js";

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

const signalRepositoryInstance = signalRepository(db);
const deadSignalRepositoryInstance = deadSignalRepository(db);

export function storeSignalServiceBuilder() {
  return {
    async storeSignal(signalEvent: SignalMessage) {
      try {
        const signal = toSignal(signalEvent);

        const signalRecordId = await signalRepositoryInstance.getSignalById(
          signalEvent.signalId,
          signalEvent.eserviceId
        );

        /* it means that signal is already present on db */
        if (signalRecordId !== null) {
          loggerInstance.info(`SignalId: ${signal.signalId} already exists`);
          throw notRecoverableMessageError("duplicateSignal", signal);
        } else {
          loggerInstance.info(
            `Signal with signalId: ${signalEvent.signalId} not found on DB`
          );
          const id = await signalRepositoryInstance.insertSignal(signal);
          loggerInstance.info(`Signal with id: ${id} has been inserted on DB`);
        }
      } catch (error) {
        loggerInstance.error(error);

        if (error instanceof NotRecoverableMessageError) {
          throw error;
        }

        throw recoverableMessageError("dbConnection");
      }
    },

    async storeDeadSignal(deadSignal: DeadSignal) {
      await deadSignalRepositoryInstance.insertDeadSignal(deadSignal);
    },
  };
}
