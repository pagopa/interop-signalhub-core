import { Logger } from "signalhub-commons";
import { IDeadEventRepository } from "../repositories/index.js";

export function deadServiceBuilder(
  deadEventRepository: IDeadEventRepository,
  logger: Logger
) {
  return {
    saveDeadEvent: async (deadEvent: any) => {
      logger.info(`Saving dead event with id: ${deadEvent.event_id}`);
      await deadEventRepository.insertDeadEvent(deadEvent);
    },
  };
}

export type DeadEventService = ReturnType<typeof deadServiceBuilder>;
