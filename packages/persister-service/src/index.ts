import { SQS } from "signalhub-commons";
import { config } from "./config/index.js";
export function processMessage(): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    console.log("message processed:", message);
  };
}

const sqsClient: SQS.SQSClient = SQS.instantiateClient({
  region: config.region,
  endpoint: config.queueEndpoint,
});

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.queueUrl,
    consumerPollingTimeout: 20,
    runUntilQueueIsEmpty: false,
  },
  processMessage()
);
