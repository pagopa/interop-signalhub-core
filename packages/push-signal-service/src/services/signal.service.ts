import { Logger, operationForbidden } from "signalhub-commons";
import { DB, createDbInstance } from "../repositories/db.js";
import { signalRepository } from "../repositories/signal.repository.js";
import { config } from "../utilities/config.js";
import { eserviceRepository } from "../repositories/eservice.repository.js";

const db: DB = createDbInstance({
  username: config.signalhubStoreDbUsername,
  password: config.signalhubStoreDbPassword,
  host: config.signalhubStoreDbHost,
  port: config.signalhubStoreDbPort,
  database: config.signalhubStoreDbName,
  schema: config.signalhubStoreDbSchema,
  useSSL: config.signalhubStoreDbUseSSL,
});

export function signalServiceBuilder() {
  return {
    async signalIdAlreadyExists(
      signalId: number,
      eserviceId: string,
      logger: Logger
    ): Promise<boolean> {
      logger.info("SignalHubService::signalAlreadyExists()");
      const signalrepository = signalRepository(db);
      const signalIdPresent = await signalrepository.findBy(
        signalId,
        eserviceId
      );
      return signalIdPresent !== null;
    },
    async isOwned(
      producerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      const repository = eserviceRepository(db);
      const state = "PUBLISHED";
      const eserviceOwned = await repository.findBy(
        producerId,
        eserviceId,
        state
      );
      logger.info(
        `EserviceService::isOwned() eserviceId: ${eserviceId} producerId: ${producerId} - eserviceOwned: ${eserviceOwned}`
      );
      if (eserviceOwned) {
        return;
      }
      throw operationForbidden;
    },
  };
}

export type SignalService = ReturnType<typeof signalServiceBuilder>;
