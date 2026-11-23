import { DB, Logger } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import {
  signalIdDuplicatedForEserviceId,
  signalStoredWithHigherSignalId
} from "../models/domain/errors.js";
import { signalRepository } from "../repositories/signal.repository.js";

export type SignalService = ReturnType<typeof signalServiceBuilder>;

interface ISignalService {
  readonly verify: (
    signalId: number,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}

export function signalServiceBuilder(db: DB): ISignalService {
  const repository = signalRepository(db);

  return {
    async verify(
      signalId: number,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `SignalService::verify signald: ${signalId}, eserviceId: ${eserviceId}`
      );
      const storedSignalId = await repository.findFirstMatchingSignalId(
        eserviceId,
        signalId,
        config.featureFlagTimeWindow ? config.timeWindowInSeconds : null
      );

      if (storedSignalId === String(signalId)) {
        throw signalIdDuplicatedForEserviceId(signalId, eserviceId);
      }

      if (storedSignalId !== null) {
        throw signalStoredWithHigherSignalId(signalId, eserviceId);
      }
    }
  };
}
