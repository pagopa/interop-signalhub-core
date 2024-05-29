import { Logger, SQS } from "signalhub-commons";
import { config } from "../utilities/config.js";

const sqsClient: SQS.SQSClient = SQS.instantiateClient({
  region: config.region,
  endpoint: config.queueEndpoint,
});

export function QuequeServiceBuilder() {
  return {
    async send(queueMessage: string, logger: Logger): Promise<void> {
      logger.debug(`QuequeService::send`);
      await SQS.sendMessage(sqsClient, config.queueUrl, queueMessage);
    },
  };
}

export type QuequeService = ReturnType<typeof QuequeServiceBuilder>;
