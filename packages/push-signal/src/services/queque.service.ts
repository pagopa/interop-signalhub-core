import { Logger, SQS } from "pagopa-signalhub-commons";
import { signalNotSendedToQueque } from "../models/domain/errors.js";
import { config } from "../config/env.js";

interface IQueueService {
  readonly send: (
    message: string,
    logger: Logger,
    queueUrl?: string
  ) => Promise<void>;
}
export function queueServiceBuilder(sqsClient: SQS.SQSClient): IQueueService {
  return {
    async send(
      message: string,
      logger: Logger,
      queueUrl: string = config.queueUrl
    ): Promise<void> {
      try {
        logger.info(`QuequeService::sending message`);
        await SQS.sendMessage(sqsClient, queueUrl, message, logger);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        logger.warn(`QuequeService::send message not sent: ${error}`);
        const requestId = error.$metadata ? error.$metadata.requestId : null;
        throw signalNotSendedToQueque(error, requestId);
      }
    },
  };
}

export type QueueService = ReturnType<typeof queueServiceBuilder>;
