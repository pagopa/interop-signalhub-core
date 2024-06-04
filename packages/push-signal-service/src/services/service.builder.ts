import { config } from "../config/config.js";
import { storeServiceBuilder, StoreService } from "./store.service.js";
import { quequeServiceBuilder, QuequeService } from "./queque.service.js";
import { domainServiceBuilder, DomainService } from "./domain.service.js";
import { DB, SQS, createDbInstance } from "signalhub-commons";
export function serviceBuilder(): {
  storeService: StoreService;
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
  const storeService = storeServiceBuilder(db);

  const sqsClient: SQS.SQSClient = SQS.instantiateClient({
    region: config.region,
    endpoint: config.queueEndpoint,
  });
  const quequeService = quequeServiceBuilder(sqsClient);
  const domainService = domainServiceBuilder();

  return {
    storeService,
    quequeService,
    domainService,
  };
}