import { DB, Logger } from "pagopa-signalhub-commons";
import { operationPullForbidden } from "../model/domain/errors.js";
import { interopRepository } from "../repositories/interop.repository.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopServiceBuilder(db: DB) {
  return {
    async consumerIsAuthorizedToPullSignals(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerIsAuthorizedToPullSignals with purposeId: ${purposeId}`
      );
      const purposeState = "ACTIVE";
      const agreementState = "ACTIVE";
      const result = await interopRepository(db).findBy(
        eserviceId,
        purposeId,
        purposeState,
        agreementState
      );
      if (result === null) {
        throw operationPullForbidden({
          eserviceId,
          purposeId,
        });
      }
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
