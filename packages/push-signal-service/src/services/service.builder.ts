import { config } from "../config/env.js";
import { storeServiceBuilder, StoreService } from "./store.service.js";
import { quequeServiceBuilder, QuequeService } from "./queque.service.js";
import { domainServiceBuilder, DomainService } from "./domain.service.js";
import { DB, SQS, createDbInstance } from "signalhub-commons";
import {
  InteropClientService,
  interopClientServiceBuilder,
} from "./interopClient.service.js";
export function serviceBuilder(): {
  storeService: StoreService;
  quequeService: QuequeService;
  domainService: DomainService;
  interopClientService: InteropClientService;
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
  const storeService = storeServiceBuilder(db);

  const sqsClient: SQS.SQSClient = SQS.instantiateClient({
    region: config.awsRegion,
    endpoint: config.queueEndpoint,
  });
  const quequeService = quequeServiceBuilder(sqsClient);
  const domainService = domainServiceBuilder();
  const interopClientService = interopClientServiceBuilder();

  return {
    storeService,
    quequeService,
    domainService,
    interopClientService,
  };
}
