import { genericInternalError, logger } from "signalhub-commons";
import { getAgreementsEventsFromId } from "signalhub-interop-client";

export function interopClientServiceBuilder() {
  const loggerInstance = logger({
    serviceName: "updater-service::interopClientService",
  });

  return {
    async getAgreementsEvents(voucher: string, lastEventId: number) {
      try {
        loggerInstance.info(`Retrieving Agremeent events from ${lastEventId}`);
        const response = await getAgreementsEventsFromId(voucher, lastEventId);
        const events = response.data.events;

        if (!events) {
          loggerInstance.info("Events list is empty");
          throw genericInternalError("events list is empty transformToError");
        }

        loggerInstance.info(`Total events retrieved: ${events.length}`);

        return events;
      } catch (error) {
        throw genericInternalError("transform to interopCommunicationError");
      }
    },
  };
}

export type InteropClientService = ReturnType<
  typeof interopClientServiceBuilder
>;
