import { Logger } from "signalhub-commons";
import { DB } from "../repositories/db.js";
import { signalRepository as signalRepository } from "../repositories/signal.repository.js";

export function signalServiceBuilder(dbInstance: DB) {
  const repository = signalRepository(dbInstance);
  return {
    async signalIdAlreadyExists(
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

export type SignalService = ReturnType<typeof signalServiceBuilder>;
