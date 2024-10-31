import { DB, Logger, SignalMessage } from "pagopa-signalhub-commons";

import {
  NotRecoverableMessageError,
  notRecoverableMessageError,
  recoverableMessageError
} from "../models/domain/errors.js";
import { DeadSignal } from "../models/domain/model.js";
import { toSignal } from "../models/domain/toSignal.js";
import { deadSignalRepository } from "../repositories/deadSignal.repository.js";
import { signalRepository } from "../repositories/signal.repository.js";

interface IStoreSignalServiceBuilder {
  readonly isSignalAlreadyOnDatabase: (
    signalRecordId: number | null
  ) => boolean;
  readonly storeDeadSignal: (deadSignal: DeadSignal) => Promise<void>;
  readonly storeSignal: (
    signalMessage: SignalMessage,
    logger: Logger
  ) => Promise<void>;
}

export function storeSignalServiceBuilder(db: DB): IStoreSignalServiceBuilder {
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

        if (this.isSignalAlreadyOnDatabase(signalRecordId)) {
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

    isSignalAlreadyOnDatabase(signalRecordId: number | null): boolean {
      return signalRecordId !== null;
    }
  };
}

export type StoreSignalService = ReturnType<typeof storeSignalServiceBuilder>;
