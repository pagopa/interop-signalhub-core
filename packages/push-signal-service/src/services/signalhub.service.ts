import { Logger } from "signalhub-commons";
import { DB } from "../repositories/db.js";
import { signalHubRepository } from "../repositories/signalhub.repository.js";

export function signalHubServiceBuilder(dbInstance: DB) {
  const repository = signalHubRepository(dbInstance);
  return {
    async signalAlreadyExists(
      signalId: number,
      eserviceId: string,
      logger: Logger
    ): Promise<boolean> {
      logger.info("SignalHubService::signalAlreadyExists()");
      const signalIdPresent = await repository.findBySignalIdAndEServiceId(
        signalId,
        eserviceId
      );
      return signalIdPresent !== null;
    },
  };
}

export type SignalHubService = ReturnType<typeof signalHubServiceBuilder>;
