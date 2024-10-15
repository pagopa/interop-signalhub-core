import { DB, Logger } from "pagopa-signalhub-commons";
import { operationPullForbidden } from "../model/domain/errors.js";
import { interopRepository } from "../repositories/interop.repository.js";

interface IInteropService {
  readonly consumerIsAuthorizedToPullSignals: (
    consumerId: string,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}
export function interopServiceBuilder(db: DB): IInteropService {
  return {
    async consumerIsAuthorizedToPullSignals(
      consumerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerIsAuthorizedToPullSignals with consumerId: ${consumerId}`
      );
      const eserviceState = "PUBLISHED";
      const agreementState = "ACTIVE";
      const purposeState = "ACTIVE";
      const result = await interopRepository(db).findBy(
        eserviceId,
        consumerId,
        eserviceState,
        purposeState,
        agreementState
      );
      if (!result?.length) {
        throw operationPullForbidden({
          eserviceId,
          consumerId,
        });
      }
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
