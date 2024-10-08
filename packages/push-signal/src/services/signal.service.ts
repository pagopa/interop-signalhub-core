import { DB, Logger } from "pagopa-signalhub-commons";
import { signalRepository } from "../repositories/signal.repository.js";

import { signalIdDuplicatedForEserviceId } from "../models/domain/errors.js";

interface ISignalService {
  readonly verifySignalDuplicated: (
    signalId: number,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}
export function signalServiceBuilder(db: DB): ISignalService {
  return {
    async verifySignalDuplicated(
      signalId: number,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `SignalService::verifySignalDuplicated signald: ${signalId}, eserviceId: ${eserviceId}`
      );
      const signalIdPresent = await signalRepository(db).findBy(
        signalId,
        eserviceId
      );

      if (signalIsDuplicated(signalIdPresent)) {
        throw signalIdDuplicatedForEserviceId(signalId, eserviceId);
      }
    },
  };
}

const signalIsDuplicated = (signalIdPresent: number | null): boolean =>
  signalIdPresent !== null;

export type SignalService = ReturnType<typeof signalServiceBuilder>;
