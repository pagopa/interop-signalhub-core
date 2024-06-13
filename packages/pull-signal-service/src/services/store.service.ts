import { DB, Logger, operationForbidden } from "signalhub-commons";
import { consumerEserviceRepository } from "../repositories/consumerEservice.repository.js";
import { signalRepository } from "../repositories/signal.repository.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function storeServiceBuilder(db: DB) {
  return {
    async pullSignal(
      signalId: number,
      consumerId: string,
      eserviceId: string,
      size: number,
      logger: Logger
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<{ signals: any[] | null; toSignalId: number }> {
      logger.debug(
        `StoreService::pullSignal signald: ${signalId}, eserviceId: ${eserviceId} consumerId: ${consumerId} size: ${size}`
      );
      const fromSignalId = 0;
      const toSignalId = size;
      const signals = await signalRepository(db).getByEservice(
        eserviceId,
        fromSignalId,
        toSignalId
      );
      return { signals, toSignalId };
    },
    async canConsumerRecoverSignal(
      consumerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
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
        `StoreService::signalConsumerIsEserviceConsumer eserviceConsumed: ${JSON.stringify(
          eserviceConsumed
        )}`
      );

      if (eserviceConsumed) {
        return;
      }
      throw operationForbidden;
    },
  };
}

export type StoreService = ReturnType<typeof storeServiceBuilder>;
