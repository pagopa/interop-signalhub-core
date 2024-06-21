import { DB, SQS, createDbInstance } from "signalhub-commons";
import { config } from "../config/env.js";
import { signalServiceBuilder, SignalService } from "./signal.service.js";
import { quequeServiceBuilder, QuequeService } from "./queque.service.js";
import { domainServiceBuilder, DomainService } from "./domain.service.js";
import { interopApiClientServiceBuilder } from "./interopApiClient.service.js";
import { InteropService, interopServiceBuilder } from "./interop.service.js";
export function serviceBuilder(): {
  signalService: SignalService;
  interopService: InteropService;
  quequeService: QuequeService;
  domainService: DomainService;
} {
  const db: DB = createDbInstance({
    username: config.signalhubStoreDbUsername,
    password: config.signalhubStoreDbPassword,
    host: config.signalhubStoreDbHost,
    port: config.signalhubStoreDbPort,
    database: config.signalhubStoreDbName,
    schema: config.signalhubStoreDbSchema,
    useSSL: config.signalhubStoreDbUseSSL,
  });
  const signalService = signalServiceBuilder(db);
  const interopService = interopServiceBuilder(
    db,
    interopApiClientServiceBuilder()
  );
  const sqsClient: SQS.SQSClient = SQS.instantiateClient({
    region: config.awsRegion,
    endpoint: config.queueEndpoint,
  });
  const quequeService = quequeServiceBuilder(sqsClient);
  const domainService = domainServiceBuilder();

  return {
    signalService,
    quequeService,
    domainService,
    interopService,
  };
}
