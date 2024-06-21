import { DB, Logger, operationForbidden } from "signalhub-commons";
import { Agreement } from "../model/domain/models.js";
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
      const agreement = await this.producerHasValidAgreement(purposeId);
      const { consumerId: producerId } = agreement;
      await this.canProducerDepositSignal(producerId, eserviceId, logger);
      logger.debug(`InteropService::verifyAuthorization END`);
    },
    async producerHasValidAgreement(purposeId: string): Promise<Agreement> {
      const agreement = await interopApiClient.getAgreementByPurposeId(
        purposeId
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
        `InteropService::canProducerDepositSignal eserviceOwned: ${eserviceOwned}`
      );

      if (eserviceOwned) {
        return;
      }
      throw operationForbidden;
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
