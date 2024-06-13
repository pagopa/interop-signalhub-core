import { Logger, SQS } from "signalhub-commons";
import { signalNotSendedToQueque } from "../model/domain/errors.js";
import { config } from "../config/env.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        logger.error(`QuequeService::send ERROR: ${error}`);
        const { requestId } = error.$metadata;
        throw signalNotSendedToQueque(requestId, error);
      }
    },
  };
}

export type QuequeService = ReturnType<typeof quequeServiceBuilder>;
