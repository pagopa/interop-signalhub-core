import { DB, Logger, operationForbidden } from "pagopa-signalhub-commons";
import { eserviceRepository } from "../repositories/eservice.repository.js";
import { purposeRepository } from "../repositories/purpose.repository.js";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopServiceBuilder(db: DB) {
  return {
    async verifyAuthorization(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.debug(`InteropService::verifyAuthorization BEGIN`);
      const organizationId = await this.getOrganizationFromPurpose(
        purposeId,
        logger
      );
      await this.canProducerDepositSignal(organizationId, eserviceId, logger);
      logger.debug(`InteropService::verifyAuthorization END`);
    },
    async getOrganizationFromPurpose(
      purposeId: string,
      logger: Logger
    ): Promise<string> {
      const state = "ACTIVE";
      const consumerId = await purposeRepository(db).findBy(purposeId, state);
      logger.debug(
        `InteropService::getOrganizationFromPurpose consumerId: ${consumerId}`
      );
      if (!consumerId) {
        throw operationForbidden;
      }
      return consumerId;
    },
    async canProducerDepositSignal(
      producerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      const state = "PUBLISHED";
      const eserviceOwned = await eserviceRepository(db).findBy(
        producerId,
        eserviceId,
        state
      );
      logger.debug(
        `InteropService::canProducerDepositSignal eserviceOwned: ${JSON.stringify(
          eserviceOwned
        )}`
      );

      if (eserviceOwned) {
        return;
      }
      throw operationForbidden;
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
