import { DB, Logger } from "pagopa-signalhub-commons";

import { operationPushForbidden } from "../models/domain/errors.js";
import { interopRepository } from "../repositories/interop.repository.js";

interface InteropServiceBuilder {
  readonly producerIsAuthorizedToPushSignals: (
    producerId: string,
    eserviceId: string,
    logger: Logger,
  ) => Promise<void>;
}

export function interopServiceBuilder(db: DB): InteropServiceBuilder {
  return {
    async producerIsAuthorizedToPushSignals(
      producerId: string,
      eserviceId: string,
      logger: Logger,
    ): Promise<void> {
      logger.info(
        `InteropService::producerIsAuthorizedToPushSignals with producerId: ${producerId}`,
      );
      const eserviceStatesAllowed = ["PUBLISHED", "DEPRECATED"];
      const result = await interopRepository(db).findBy(
        eserviceId,
        producerId,
        eserviceStatesAllowed,
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

function isNotEserviceVersionPublishedOrDeprecated(list: string[]): boolean {
  return !list?.length;
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
