import { Logger } from "pagopa-signalhub-commons";
import { IEserviceRepository } from "../repositories/eservice.repository.js";

export function eServiceServiceBuilder(
  _eServiceRepository: IEserviceRepository
) {
  return {
    async update(logger: Logger): Promise<void> {
      logger.debug("updating event");
    },

    async insert(logger: Logger): Promise<void> {
      logger.debug("inserting event");
    },

    async delete(logger: Logger): Promise<void> {
      logger.debug("deleting event");
    },
  };
}

export type EServiceService = ReturnType<typeof eServiceServiceBuilder>;
