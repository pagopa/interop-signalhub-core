import { DB, Logger } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import {
  signalIdDuplicatedForEserviceId,
  signalStoredWithHigherSignalId
} from "../models/domain/errors.js";
import { signalRepository } from "../repositories/signal.repository.js";

interface ISignalService {
  readonly verify: (
    signalId: number,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}
export function signalServiceBuilder(db: DB): ISignalService {
  return {
    async verify(
      signalId: number,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `SignalService::verify signald: ${signalId}, eserviceId: ${eserviceId}`
      );
      const signalIdPresent = await signalRepository(db).findBy(
        signalId,
        eserviceId
      );

      if (signalIsDuplicated(signalIdPresent)) {
        throw signalIdDuplicatedForEserviceId(signalId, eserviceId);
      }

      const signalsWithHigherSignalId = await signalRepository(
        db
      ).findSignalsWithSignalIdMajorThanAndAlreadyStored(
        eserviceId,
        signalId,
        config.timeWindowInSeconds
      );

      if (signalsWithHigherSignalId && signalsWithHigherSignalId.length > 0) {
        throw signalStoredWithHigherSignalId(signalId, eserviceId);
      }
    }
  };
}

const signalIsDuplicated = (signalIdPresent: number | null): boolean =>
  signalIdPresent !== null;

export type SignalService = ReturnType<typeof signalServiceBuilder>;
