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
      const eserviceStatesAllowed = ["PUBLISHED", "DEPRECATED"];
      const result = await interopRepository(db).findBy(
        eserviceId,
        producerId,
        eserviceStatesAllowed
      );

      if (isNotEserviceVersionPublishedOrDeprecated(result)) {
        throw operationPushForbidden({
          eserviceId,
          producerId,
        });
      }
    },
  };
}

function isNotEserviceVersionPublishedOrDeprecated(
  list: string[] | null
): boolean {
  return !list || list.length <= 0 ? true : false;
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
