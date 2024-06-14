import { Logger, operationForbidden } from "signalhub-commons";
import { InteropClientService } from "../services/interopClient.service.js";
import { StoreService } from "../services/store.service.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const producerAuthorization = (
  storeService: StoreService,
  interopClientService: InteropClientService,
  logger: Logger
) => ({
  async verify(purposeId: string, eserviceId: string): Promise<void> {
    logger.debug(`producerAuthorization BEGIN`);
    const response = await interopClientService.getAgreementByPurposeId(
      purposeId
    );
    const agreement = response.data;
    if (!agreement) {
      logger.error(`producerAuthorization Agreement not found`);
      throw operationForbidden;
    }
    const { consumerId: producerId } = agreement;
    await storeService.canProducerDepositSignal(producerId, eserviceId, logger);
    logger.debug(`producerAuthorization END`);
  },
});
