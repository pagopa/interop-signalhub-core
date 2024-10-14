import { DB, Logger } from "pagopa-signalhub-commons";
import { operationPullForbidden } from "../model/domain/errors.js";
import { interopRepository } from "../repositories/interop.repository.js";

interface IInteropService {
  readonly consumerIsAuthorizedToPullSignals: (
    organizationId: string,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}
export function interopServiceBuilder(db: DB): IInteropService {
  return {
    async consumerIsAuthorizedToPullSignals(
      organizationId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerIsAuthorizedToPullSignals with organizationId: ${organizationId}`
      );
      const eserviceState = "PUBLISHED";
      const agreementState = "ACTIVE";
      const purposeState = "ACTIVE";
      const result = await interopRepository(db).findBy(
        eserviceId,
        organizationId,
        eserviceState,
        purposeState,
        agreementState
      );
      if (!result?.length) {
        throw operationPullForbidden({
          eserviceId,
          organizationId,
        });
      }
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
