import { DB, Logger } from "pagopa-signalhub-commons";
import { interopRepository } from "../repositories/interop.repository.js";
import {
  operationPushForbiddenGeneric,
  operationPushForbiddenWrongEservice,
} from "../models/domain/errors.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopServiceBuilder(db: DB) {
  return {
    async producerIsAuthorizedToPushSignals(
      purposeId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerIsAuthorizedToPushSignals with purposeId: ${purposeId}`
      );
      const purposeState = "ACTIVE";
      const result = await interopRepository(db).findBy(
        eserviceId,
        purposeId,
        purposeState
      );
      if (result === null) {
        throw operationPushForbiddenGeneric({
          eserviceId,
          purposeId,
        });
      }
      const { eservice } = result;
      if (!eservice?.id || eservice.state !== "PUBLISHED") {
        throw operationPushForbiddenWrongEservice({
          eservice: {
            id: eservice?.id,
            state: eservice?.state,
            producerId: eservice?.producerId,
          },
        });
      }
    },
    // async producerCanPushSignals(
    //   purposeId: string,
    //   eserviceId: string,
    //   logger: Logger
    // ): Promise<void> {
    //   logger.debug(`InteropService::verifyAuthorization BEGIN`);
    //   const organizationId = await this.getOrganizationFromPurpose(
    //     purposeId,
    //     logger
    //   );
    //   await this.canProducerDepositSignal(organizationId, eserviceId, logger);
    //   logger.debug(`InteropService::verifyAuthorization END`);
    // },
    // async getOrganizationFromPurpose(
    //   purposeId: string,
    //   logger: Logger
    // ): Promise<string> {
    //   const state = "ACTIVE";
    //   const consumerId = await purposeRepository(db).findBy(purposeId, state);
    //   logger.debug(
    //     `InteropService::getOrganizationFromPurpose consumerId: ${consumerId}`
    //   );
    //   if (!consumerId) {
    //     throw operationForbidden;
    //   }
    //   return consumerId;
    // },
    // async canProducerDepositSignal(
    //   producerId: string,
    //   eserviceId: string,
    //   logger: Logger
    // ): Promise<void> {
    //   const state = "PUBLISHED";
    //   const eserviceOwned = await eserviceRepository(db).findBy(
    //     producerId,
    //     eserviceId,
    //     state
    //   );
    //   logger.debug(
    //     `InteropService::canProducerDepositSignal eserviceOwned: ${JSON.stringify(
    //       eserviceOwned
    //     )}`
    //   );

    //   if (eserviceOwned) {
    //     return;
    //   }
    //   throw operationForbidden;
    // },
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;
