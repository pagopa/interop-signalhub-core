import { Logger } from "signalhub-commons";
import { DB } from "../repositories/db.js";
import { signalHubRepository } from "../repositories/signalhub.repository.js";

export function signalHubServiceBuilder(dbInstance: DB) {
  const repository = signalHubRepository(dbInstance);
  return {
    async getAThing(logger: Logger) {
      logger.info("SignalHubService::getAThing()");
      const some = await repository.readSomething();
      return some;
    },
  };
}

export type SignalHubService = ReturnType<typeof signalHubServiceBuilder>;
