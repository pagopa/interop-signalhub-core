import { DB, SQS, createDbInstance } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { InteropService, interopServiceBuilder } from "./interop.service.js";
import { QueueService, queueServiceBuilder } from "./queque.service.js";
import { SignalService, signalServiceBuilder } from "./signal.service.js";
export function serviceBuilder(): {
  interopService: InteropService;
  quequeService: QueueService;
  signalService: SignalService;
} {
  const db: DB = createDbInstance({
    database: config.signalhubStoreDbName,
    host: config.signalhubStoreDbHost,
    maxConnectionPool: config.maxConnectionPool,
    password: config.signalhubStoreDbPassword,
    port: config.signalhubStoreDbPort,
    useSSL: config.signalhubStoreDbUseSSL,
    username: config.signalhubStoreDbUsername,
  });
  const signalService = signalServiceBuilder(db);
  const interopService = interopServiceBuilder(db);

  const sqsClient: SQS.SQSClient = SQS.instantiateClient({
    endpoint: config.queueUrl,
  });
  const quequeService = queueServiceBuilder(sqsClient);

  return {
    interopService,
    quequeService,
    signalService,
  };
}
