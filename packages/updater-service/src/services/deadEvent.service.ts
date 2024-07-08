import { Logger } from "signalhub-commons";

export function deadServiceBuilder(deadEventRepository: any, logger: Logger) {
  return {
    saveDeadEvent: async (deadEvent: any) => {
      logger.info(`Saving dead event with id: ${deadEvent.id}`);
      await deadEventRepository.insertDeadEvent(deadEvent);
    },
  };
}
