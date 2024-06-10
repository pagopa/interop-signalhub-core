import { Logger, SQS } from "signalhub-commons";
import { signalNotSendedToQueque } from "../model/domain/errors.js";
import { config } from "../config/env.js";

export function quequeServiceBuilder(sqsClient: SQS.SQSClient) {
  return {
    async send(
      message: string,
      logger: Logger,
      queueUrl: string = config.queueUrl
    ): Promise<void> {
      try {
        await SQS.sendMessage(sqsClient, queueUrl, message);
        logger.debug(`QuequeService::send message: ${message}`);
      } catch (error: any) {
        logger.error(`QuequeService::send ERROR: ${error}`);
        const { requestId } = error.$metadata;
        throw signalNotSendedToQueque(requestId, error);
      }
    },
  };
}

export type QuequeService = ReturnType<typeof quequeServiceBuilder>;
