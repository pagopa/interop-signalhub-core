import { DB, Logger, operationForbidden } from "pagopa-signalhub-commons";
import { agreementRepository } from "../repositories/agreement.repository.js";
import { purposeRepository } from "../repositories/index.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopServiceBuilder(db: DB) {
  return {
    async verifyAuthorization(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.debug(`InteropService::verifyAuthorization BEGIN`);
      const consumerId = await this.getConsumerIdByPurpose(purposeId, logger);
      await this.consumerCanAccessToEservice(consumerId, eserviceId, logger);
      logger.debug(`InteropService::verifyAuthorization END`);
    },

    async consumerCanAccessToEservice(
      consumerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerCanAccessToEservice consumerId: ${consumerId} eserviceId: ${eserviceId}`
      );
      const state = "ACTIVE";
      const eserviceConsumed = await agreementRepository(db).findBy(
        consumerId,
        eserviceId,
        state
      );
      if (eserviceConsumed) {
        return;
      }
      throw operationForbidden;
    },

    async getConsumerIdByPurpose(
      purposeId: string,
      logger: Logger
    ): Promise<string> {
      const state = "ACTIVE";
      const consumerId = await purposeRepository(db).findBy(purposeId, state);
      logger.debug(
        `InteropService::getConsumerIdByPuropose consumerId: ${consumerId}`
      );
      if (!consumerId) {
        throw operationForbidden;
      }
      return consumerId;
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
