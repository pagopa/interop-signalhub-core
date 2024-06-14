import { DB, Logger, operationForbidden } from "signalhub-commons";
import { consumerEserviceRepository } from "../repositories/consumerEservice.repository.js";
import { signalRepository } from "../repositories/signal.repository.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function storeServiceBuilder(db: DB) {
  return {
    async pullSignal(
      eserviceId: string,
      signalId: number,
      limit: number,
      logger: Logger
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<{ signals: any[] | null; lastSignalId: number | null }> {
      logger.debug(
        `StoreService::pullSignal eserviceId: ${eserviceId}, signalId:   ${signalId}, limit: ${limit}`
      );
      const signals = await signalRepository(db).getByEservice(
        eserviceId,
        signalId,
        limit
      );
      const nextSignalId = Number(signalId) + Number(limit);
      const { signal_id: lastSignalId } = await signalRepository(
        db
      ).getNextSignalId(eserviceId, nextSignalId);
      return { signals, lastSignalId };
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
