import { DB, Logger } from "pagopa-signalhub-commons";

import { operationPushForbidden } from "../models/domain/errors.js";
import { interopRepository } from "../repositories/interop.repository.js";

export type InteropService = ReturnType<typeof interopServiceBuilder>;

interface InteropServiceBuilder {
  readonly producerIsAuthorizedToPushSignals: (
    producerId: string,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}

export function interopServiceBuilder(db: DB): InteropServiceBuilder {
  const repository = interopRepository(db);
  const allowedStates = ["PUBLISHED", "DEPRECATED", "ARCHIVING"] as const;

  return {
    async producerIsAuthorizedToPushSignals(
      producerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::producerIsAuthorizedToPushSignals with producerId: ${producerId}`
      );
      const hasEnabledDescriptor = await repository.hasEnabledDescriptor(
        eserviceId,
        producerId,
        allowedStates
      );

      if (!hasEnabledDescriptor) {
        throw operationPushForbidden({
          eserviceId,
          producerId
        });
      }
    }
  };
}
