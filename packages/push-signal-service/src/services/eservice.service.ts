import { Logger, operationForbidden } from "signalhub-commons";
import { DB } from "../repositories/db.js";
import { eserviceRepository } from "../repositories/eservice.repository.js";

export function _eserviceServiceBuilder(dbInstance: DB) {
  const repository = eserviceRepository(dbInstance);
  return {
    async isOwned(
      eserviceId: string,
      producerId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `EserviceService::isOwned() eserviceId: ${eserviceId} producerId: ${producerId}`
      );
      const state = "PUBLISHED";
      const eserviceOwned = await repository.findBy(
        eserviceId,
        producerId,
        state
      );
      if (eserviceOwned) {
        return;
      }
      throw operationForbidden;
    },
  };
}

export type EserviceService = ReturnType<typeof _eserviceServiceBuilder>;
