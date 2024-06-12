import { Logger, operationForbidden } from "signalhub-commons";
import { InteropClientService } from "../services/interopClient.service.js";
import { StoreService } from "../services/store.service.js";

export const consumerAuthorization = (
  storeService: StoreService,
  interopClientService: InteropClientService,
  logger: Logger
) => {
  return {
    async verify(purposeId: string, eserviceId: string) {
      logger.debug(`consumerAuthorization BEGIN`);
      const response = await interopClientService.getAgreementByPurposeId(
        purposeId
      );
      const agreement = response.data;
      if (!agreement) {
        logger.error(`consumerAuthorization Agreement not found`);
        throw operationForbidden;
      }
      const { consumerId } = agreement;
      await storeService.canConsumerRecoverSignal(
        consumerId,
        eserviceId,
        logger
      );
      logger.debug(`consumerAuthorization END`);
    },
  };
};
