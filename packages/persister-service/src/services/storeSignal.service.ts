import { DB, logger, SignalMessage } from "signalhub-commons";
import { toSignal } from "../models/domain/toSignal.js";
import { signalRepository } from "../repositories/signal.repository.js";
import { deadSignalRepository } from "../repositories/deadSignal.repository.js";
import { DeadSignal } from "../models/domain/model.js";
import {
  NotRecoverableMessageError,
  notRecoverableMessageError,
  recoverableMessageError,
} from "../models/domain/errors.js";

const loggerInstance = logger({});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function storeSignalServiceBuilder(db: DB) {
  return {
    async storeSignal(signalMessage: SignalMessage): Promise<void> {
      try {
        const signalRepositoryInstance = signalRepository(db);
        const signal = toSignal(signalMessage);

        const signalRecordId = await signalRepositoryInstance.getSignalById(
          signalMessage.signalId,
          signalMessage.eserviceId
        );

        /* it means that signal is already present on db */
        if (signalRecordId !== null) {
          loggerInstance.info(`SignalId: ${signal.signalId} already exists`);
          throw notRecoverableMessageError("duplicateSignal", signal);
        } else {
          loggerInstance.info(
            `Signal with signalId: ${signalMessage.signalId} not found on DB`
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

    async storeDeadSignal(deadSignal: DeadSignal): Promise<void> {
      await deadSignalRepository(db).insertDeadSignal(deadSignal);
    },
  };
}

export type StoreSignalService = ReturnType<typeof storeSignalServiceBuilder>;
