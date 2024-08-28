import { DB, Logger } from "pagopa-signalhub-commons";
import { agreementRepository } from "../repositories/agreement.repository.js";
import { purposeRepository } from "../repositories/index.js";
import { operationPullForbidden } from "../model/domain/errors.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopServiceBuilder(db: DB) {
  return {
    async verifyAuthorization(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(`InteropService::verifyAuthorization BEGIN`);
      const consumerId = await this.getConsumerIdByPurpose(purposeId, logger);
      await this.consumerCanAccessToEservice(consumerId, eserviceId, logger);
      logger.info(`InteropService::verifyAuthorization END`);
    },

    async consumerCanAccessToEservice(
      consumerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerCanAccessToEservice with consumerId: ${consumerId}`
      );
      const state = "ACTIVE";
      const eserviceConsumed = await agreementRepository(db).findBy(
        consumerId,
        eserviceId,
        state
      );
      if (!eserviceConsumed) {
        throw operationPullForbidden({ consumerId });
      }
    },

    async getConsumerIdByPurpose(
      purposeId: string,
      logger: Logger
    ): Promise<string> {
      logger.info(`InteropService::getConsumerIdByPurpose`);
      const state = "ACTIVE";
      const consumerId = await purposeRepository(db).findBy(purposeId, state);
      if (!consumerId) {
        throw operationPullForbidden({ purposeId });
      }
      return consumerId;
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
