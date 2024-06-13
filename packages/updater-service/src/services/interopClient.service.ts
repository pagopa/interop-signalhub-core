import { Logger, genericInternalError } from "signalhub-commons";
import {
  getAgreement,
  getAgreementsEventsFromId,
} from "signalhub-interop-client";
import { ConsumerEserviceEntity } from "../models/domain/model.js";
import { toConsumerEservice } from "../models/domain/toConsumerEservice.js";

export function interopClientServiceBuilder(
  voucher: string,
  loggerInstance: Logger
) {
  return {
    async getAgreementsEvents(lastEventId: number) {
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

    async getConsumerEservice(
      agreementId: string,
      eventId: number
    ): Promise<ConsumerEserviceEntity> {
      const { data: agreement } = await getAgreement(voucher, agreementId);

      const consumerEserviceEntity = toConsumerEservice(agreement, eventId);
      return consumerEserviceEntity;
    },
  };
}

export type InteropClientService = ReturnType<
  typeof interopClientServiceBuilder
>;
