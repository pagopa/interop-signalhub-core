import { DB, Logger } from "pagopa-signalhub-commons";
import { interopRepository } from "../repositories/interop.repository.js";
import { operationPushForbidden } from "../models/domain/errors.js";

interface InteropServiceBuilder {
  readonly producerIsAuthorizedToPushSignals: (
    producerId: string,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}

export function interopServiceBuilder(db: DB): InteropServiceBuilder {
  return {
    async producerIsAuthorizedToPushSignals(
      producerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::producerIsAuthorizedToPushSignals with producerId: ${producerId}`
      );
      const eserviceState = "PUBLISHED";
      const result = await interopRepository(db).findBy(
        eserviceId,
        producerId,
        eserviceState
      );

      if (result === null) {
        throw operationPushForbidden({
          eserviceId,
          producerId,
        });
      }
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
