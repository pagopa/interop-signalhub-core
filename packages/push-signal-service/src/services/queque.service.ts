import { Logger, SQS } from "signalhub-commons";
import { config } from "../config/config.js";
import { signalNotSendedToQueque } from "../model/domain/errors.js";

const sqsClient: SQS.SQSClient = SQS.instantiateClient({
  region: config.region,
  endpoint: config.queueEndpoint,
});

export function quequeServiceBuilder() {
  return {
    async send(message: string, logger: Logger): Promise<void> {
      try {
        await SQS.sendMessage(sqsClient, config.queueUrl, message);
        logger.debug(`QuequeService::send message: ${message}`);
      } catch (error: any) {
        logger.error(`QuequeService::send ERROR: ${error}`);
        const { requestId } = error.$metadata;
        throw signalNotSendedToQueque(requestId, error.code);
      }
    },
  };
}

export type QuequeService = ReturnType<typeof quequeServiceBuilder>;
