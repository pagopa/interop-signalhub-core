import { Logger, SQS } from "pagopa-signalhub-commons";
import { signalNotSendedToQueque } from "../models/domain/errors.js";
import { config } from "../config/env.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function queueServiceBuilder(sqsClient: SQS.SQSClient) {
  return {
    async send(
      message: string,
      logger: Logger,
      queueUrl: string = config.queueUrl
    ): Promise<void> {
      try {
        logger.info(`QuequeService::send message ${message}`);
        await SQS.sendMessage(sqsClient, queueUrl, message);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        logger.warn(`QuequeService::send message not sent: ${error}`);
        const { requestId } = error.$metadata;
        throw signalNotSendedToQueque(requestId, error);
      }
    },
  };
}

export type QueueService = ReturnType<typeof queueServiceBuilder>;
