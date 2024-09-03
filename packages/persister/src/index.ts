import {
  DB,
  SQS,
  createDbInstance,
  logger,
  correlationId,
} from "pagopa-signalhub-commons";

import { config } from "./config/env.js";
import { processMessage } from "./messageHandler.js";
import { storeSignalServiceBuilder } from "./services/storeSignal.service.js";

const loggerInstance = logger({
  serviceName: "persister",
  correlationId: correlationId(),
});

const sqsClient: SQS.SQSClient = SQS.instantiateClient({
  endpoint: config.queueUrl,
});

const db: DB = createDbInstance({
  username: config.signalhubStoreDbUsername,
  password: config.signalhubStoreDbPassword,
  host: config.signalhubStoreDbHost,
  port: config.signalhubStoreDbPort,
  database: config.signalhubStoreDbName,
  useSSL: config.signalhubStoreDbUseSSL,
});

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.queueUrl,
    consumerPollingTimeout: 20,
    runUntilQueueIsEmpty: false,
  },
  processMessage(storeSignalServiceBuilder(db), loggerInstance),
  loggerInstance
);
