import { SQS } from "signalhub-commons";
import { config } from "./config/index.js";
import { processMessage } from "./messageHandler.js";

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
