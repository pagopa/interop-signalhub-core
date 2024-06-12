import { DB, Logger, operationForbidden } from "signalhub-commons";
import { consumerEserviceRepository } from "../repositories/consumerEservice.repository.js";

export function storeServiceBuilder(db: DB) {
  return {
    async canConsumerRecoverSignal(
      consumerId: string,
      eserviceId: string,
      logger: Logger
    ) {
      logger.info(
        `StoreService::canProducerRecoverSignal consumerId: ${consumerId} eserviceId: ${eserviceId}`
      );
      const state = "ACTIVE";
      const eserviceConsumed = await consumerEserviceRepository(db).findBy(
        consumerId,
        eserviceId,
        state
      );
      logger.debug(
        `StoreService::signalConsumerIsEserviceConsumer eserviceConsumed: ${eserviceConsumed}`
      );

      if (eserviceConsumed) {
        return;
      }
      throw operationForbidden;
    },
  };
}

export type StoreService = ReturnType<typeof storeServiceBuilder>;
