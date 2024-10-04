import { DB, Logger } from "pagopa-signalhub-commons";
import { interopRepository } from "../repositories/interop.repository.js";
import { operationPushForbidden } from "../models/domain/errors.js";

interface InteropServiceBuilder {
  readonly producerIsAuthorizedToPushSignals: (
    purposeId: string,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}
export function interopServiceBuilder(db: DB): InteropServiceBuilder {
  return {
    async producerIsAuthorizedToPushSignals(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerIsAuthorizedToPushSignals with purposeId: ${purposeId}`
      );
      const purposeState = "ACTIVE";
      const eserviceState = "PUBLISHED";
      const result = await interopRepository(db).findBy(
        eserviceId,
        purposeId,
        purposeState,
        eserviceState
      );
      if (result === null) {
        throw operationPushForbidden({
          eserviceId,
          purposeId,
        });
      }
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
