import { DB, Logger } from "pagopa-signalhub-commons";
import {
  operationPullForbiddenGeneric,
  operationPullForbiddenWrongAgreement,
} from "../model/domain/errors.js";
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
      const result = await interopRepository(db).findBy(
        eserviceId,
        purposeId,
        purposeState
      );
      if (result === null) {
        throw operationPullForbiddenGeneric({
          eserviceId,
          purposeId,
        });
      }
      const { agreement } = result;
      if (!agreement?.id || agreement.state !== "ACTIVE") {
        throw operationPullForbiddenWrongAgreement({
          eservice: { id: eserviceId },
          agreement: {
            id: agreement?.id,
            state: agreement?.state,
            consumerId: agreement?.consumerId,
          },
        });
      }
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
