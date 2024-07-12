import { DB, Logger, operationForbidden } from "pagopa-signalhub-commons";
import { consumerEserviceRepository } from "../repositories/consumerEservice.repository.js";
import { Agreement } from "../model/domain/models.js";
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
      const agreement = await this.consumerHasValidAgreement(purposeId);
      const { consumerId } = agreement;
      await this.consumerCanAccessToEservice(consumerId, eserviceId, logger);
      logger.debug(`InteropService::verifyAuthorization END`);
    },
    async consumerHasValidAgreement(purposeId: string): Promise<Agreement> {
      const agreement = await interopApiClient.getAgreementByPurposeId(
        purposeId
      );
      if (!agreement) {
        throw operationForbidden;
      }
      return agreement as unknown as Agreement; // TODO fix this
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
      const eserviceConsumed = await consumerEserviceRepository(db).findBy(
        consumerId,
        eserviceId,
        state
      );
      if (eserviceConsumed) {
        return;
      }
      throw operationForbidden;
    },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
