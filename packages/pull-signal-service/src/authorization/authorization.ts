import { Logger, operationForbidden } from "signalhub-commons";
import { InteropClientService } from "../services/interopClient.service.js";
import { StoreService } from "../services/store.service.js";

export const consumerAuthorization = (
  storeService: StoreService,
  interopClientService: InteropClientService,
  logger: Logger
): {
  verify: (purposeId: string, eserviceId: string) => Promise<void>;
} => ({
  async verify(purposeId: string, eserviceId: string): Promise<void> {
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
    await storeService.canConsumerRecoverSignal(consumerId, eserviceId, logger);
    logger.debug(`consumerAuthorization END`);
  },
});
