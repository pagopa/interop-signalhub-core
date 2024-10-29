import { DB, SQS, createDbInstance, logger } from "pagopa-signalhub-commons";

import { config } from "./config/env.js";
import { processMessage } from "./messageHandler.js";
import { storeSignalServiceBuilder } from "./services/storeSignal.service.js";

const loggerInstance = logger({
  serviceName: "persister",
});

const sqsClient: SQS.SQSClient = SQS.instantiateClient({
  endpoint: config.queueUrl,
});

const db: DB = createDbInstance({
  database: config.signalhubStoreDbName,
  host: config.signalhubStoreDbHost,
  maxConnectionPool: config.maxConnectionPool,
  password: config.signalhubStoreDbPassword,
  port: config.signalhubStoreDbPort,
  useSSL: config.signalhubStoreDbUseSSL,
  username: config.signalhubStoreDbUsername,
});

await SQS.runConsumer(
  sqsClient,
  {
    consumerPollingTimeout: 20,
    queueUrl: config.queueUrl,
    runUntilQueueIsEmpty: false,
  },
  processMessage(storeSignalServiceBuilder(db)),
  loggerInstance,
);
