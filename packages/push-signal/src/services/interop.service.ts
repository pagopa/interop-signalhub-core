import { DB, Logger, operationForbidden } from "pagopa-signalhub-commons";
import { Agreement } from "../models/domain/models.js";
import { eserviceRepository } from "../repositories/eservice.repository.js";
import { InteropApiClientService } from "./interopApiClient.service.js";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopServiceBuilder(
  db: DB,
  interopApiClient: InteropApiClientService
) {
  return {
    async verifyAuthorization(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.debug(`InteropService::verifyAuthorization BEGIN`);
      const agreement = await this.producerHasValidAgreement(purposeId, logger);
      const { consumerId: producerId } = agreement;
      await this.canProducerDepositSignal(producerId, eserviceId, logger);
      logger.debug(`InteropService::verifyAuthorization END`);
    },
    async producerHasValidAgreement(
      purposeId: string,
      logger: Logger
    ): Promise<Agreement> {
      const agreement = await interopApiClient.getAgreementByPurposeId(
        purposeId
      );
      logger.debug(
        `InteropService::producerHasValidAgreement agreement: ${JSON.stringify(
          agreement
        )}`
      );
      if (!agreement) {
        throw operationForbidden;
      }
      return agreement as unknown as Agreement; // TODO fix this
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
