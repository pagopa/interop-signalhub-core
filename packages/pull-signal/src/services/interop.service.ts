import { DB, Logger } from "pagopa-signalhub-commons";
import { agreementRepository } from "../repositories/agreement.repository.js";
import { purposeRepository } from "../repositories/index.js";
import {
  operationPullForbidden,
  operationPullForbiddenWithWrongAgreement,
} from "../model/domain/errors.js";
import { interopRepository } from "../repositories/interop.repository.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopServiceBuilder(db: DB) {
  return {
    async verifyAuthorization(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::verifyAuthorization with purposeId: ${purposeId}`
      );
      await this.consumerHasValidAgreement(purposeId, eserviceId);
      // const consumerId = await this.getConsumerIdByPurpose(purposeId, logger);
      // await this.consumerCanAccessToEservice(consumerId, eserviceId, logger);
    },
    async consumerHasValidAgreement(
      purposeId: string,
      eserviceId: string
    ): Promise<void> {
      const purposeState = "ACTIVE";
      const result = await interopRepository(db).findBy(
        eserviceId,
        purposeId,
        purposeState
      );
      if (result === null) {
        throw operationPullForbidden({
          eserviceId,
          purposeId,
        });
      }
      const { agreement } = result;
      if (!agreement?.id || agreement.state !== "ACTIVE") {
        throw operationPullForbiddenWithWrongAgreement({
          eservice: { id: eserviceId },
          agreement: {
            id: agreement?.id,
            state: agreement?.state,
            consumerId: agreement?.consumerId,
          },
        });
      }
    },
    async consumerCanAccessToEservice(
      consumerId: string,
      eserviceId: string
    ): Promise<void> {
      const state = "ACTIVE";
      const eserviceConsumed = await agreementRepository(db).findBy(
        consumerId,
        eserviceId,
        state
      );
      if (!eserviceConsumed) {
        throw operationPullForbidden({});
      }
    },

    async getConsumerIdByPurpose(purposeId: string): Promise<string> {
      const state = "ACTIVE";
      const consumerId = await purposeRepository(db).findBy(purposeId, state);
      if (!consumerId) {
        throw operationPullForbidden({});
      }
      return consumerId;
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
