import { DB, Logger, operationForbidden } from "signalhub-commons";
import { signalRepository } from "../repositories/signal.repository.js";

import { eserviceRepository } from "../repositories/eservice.repository.js";
import { signalIdDuplicatedForEserviceId } from "../model/domain/errors.js";

export function storeServiceBuilder(db: DB) {
  return {
    async verifySignalDuplicated(
      signalId: number,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.debug(
        `StoreService::verifySignalDuplicated signald: ${signalId}, eserviceId: ${eserviceId}`
      );
      const signalIdPresent = await signalRepository(db).findBy(
        signalId,
        eserviceId
      );

      if (signalIsDuplicated(signalIdPresent)) {
        throw signalIdDuplicatedForEserviceId(signalId, eserviceId);
      }
    },
    async canProducerDepositSignal(
      producerId: string,
      eserviceId: string,
      logger: Logger
    ) {
      logger.info(
        `StoreService::canProducerDepositSignal eserviceId: ${eserviceId} producerId: ${producerId}`
      );
      const state = "PUBLISHED";
      const eserviceOwned = await eserviceRepository(db).findBy(
        producerId,
        eserviceId,
        state
      );
      logger.debug(
        `StoreService::canProducerDepositSignal eserviceOwned: ${eserviceOwned}`
      );

      if (eserviceOwned) {
        return;
      }
      throw operationForbidden;
    },
  };
}

const signalIsDuplicated = (signalIdPresent: number | null) =>
  signalIdPresent !== null;

export type StoreService = ReturnType<typeof storeServiceBuilder>;
