import { DB, Logger, SignalMessage } from "pagopa-signalhub-commons";
import { toSignal } from "../models/domain/toSignal.js";
import { signalRepository } from "../repositories/signal.repository.js";
import { deadSignalRepository } from "../repositories/deadSignal.repository.js";
import { DeadSignal } from "../models/domain/model.js";
import {
  NotRecoverableMessageError,
  notRecoverableMessageError,
  recoverableMessageError,
} from "../models/domain/errors.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function storeSignalServiceBuilder(db: DB) {
  return {
    async storeSignal(
      signalMessage: SignalMessage,
      logger: Logger
    ): Promise<void> {
      try {
        logger.info(`Saving signalId ${signalMessage.signalId} on DB`);
        const signalRepositoryInstance = signalRepository(db);
        const signal = toSignal(signalMessage);

        const signalRecordId = await signalRepositoryInstance.getSignalById(
          signalMessage.signalId,
          signalMessage.eserviceId
        );

        /* it means that signal is already present on db */
        if (signalRecordId !== null) {
          logger.warn(
            `SignalId: ${signal.signalId} already exists (NotRecoverableMessage)`
          );
          throw notRecoverableMessageError(
            "duplicateSignal",
            signal,
            signalMessage.correlationId
          );
        } else {
          await signalRepositoryInstance.insertSignal(signal);
        }
      } catch (error) {
        if (error instanceof NotRecoverableMessageError) {
          throw error;
        }

        logger.error(error);

        throw recoverableMessageError(
          "dbConnection",
          signalMessage.correlationId
        );
      }
    },

    async storeDeadSignal(deadSignal: DeadSignal): Promise<void> {
      await deadSignalRepository(db).insertDeadSignal(deadSignal);
    },
  };
}

export type StoreSignalService = ReturnType<typeof storeSignalServiceBuilder>;
