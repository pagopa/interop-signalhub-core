import { DB, SQS, createDbInstance, logger } from "signalhub-commons";
import { config } from "./config/env.js";
import { processMessage } from "./messageHandler.js";
import { storeSignalServiceBuilder } from "./services/storeSignal.service.js";

const loggerInstance = logger({
  serviceName: "persister",
});

const sqsClient: SQS.SQSClient = SQS.instantiateClient();

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
  processMessage(storeSignalServiceBuilder(db, loggerInstance), loggerInstance)
);
