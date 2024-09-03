import { DB, SQS, createDbInstance } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";
import { signalServiceBuilder, SignalService } from "./signal.service.js";
import { queueServiceBuilder, QueueService } from "./queque.service.js";
import { InteropService, interopServiceBuilder } from "./interop.service.js";
export function serviceBuilder(): {
  signalService: SignalService;
  interopService: InteropService;
  quequeService: QueueService;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    useSSL: config.signalhubStoreDbUseSSL,
  });
  const signalService = signalServiceBuilder(db);
  const interopService = interopServiceBuilder(db);

  const sqsClient: SQS.SQSClient = SQS.instantiateClient({
    endpoint: config.queueUrl,
  });
  const quequeService = queueServiceBuilder(sqsClient);

  return {
    signalService,
    quequeService,
    interopService,
  };
}
