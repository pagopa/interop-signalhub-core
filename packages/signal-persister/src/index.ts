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
  username: config.signalhubStoreDbUsername,
  password: config.signalhubStoreDbPassword,
  host: config.signalhubStoreDbHost,
  port: config.signalhubStoreDbPort,
  database: config.signalhubStoreDbName,
  useSSL: config.signalhubStoreDbUseSSL,
  maxConnectionPool: config.maxConnectionPool,
});

await SQS.runConsumer(
  sqsClient,
  {
    queueUrl: config.queueUrl,
    consumerPollingTimeout: 20,
    runUntilQueueIsEmpty: false,
  },
  processMessage(storeSignalServiceBuilder(db)),
  loggerInstance
);
