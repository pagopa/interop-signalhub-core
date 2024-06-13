import { Logger, genericInternalError } from "signalhub-commons";
import {
  getAgreement,
  getAgreementsEventsFromId,
  Event,
  getEservice,
  EService,
  EServiceDescriptor,
  getEServiceDescriptor,
} from "signalhub-interop-client";
import { ConsumerEserviceEntity } from "../models/domain/model.js";
import { toConsumerEservice } from "../models/domain/toConsumerEservice.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopClientServiceBuilder(
  voucher: string,
  loggerInstance: Logger
) {
  return {
    async getAgreementsEvents(lastEventId: number): Promise<Event[]> {
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

      return toConsumerEservice(agreement, eventId);
    },

    async getEservice(eserviceId: string): Promise<EService> {
      const { data: eservice } = await getEservice(eserviceId, voucher);
      return eservice;
    },

    async getEserviceDescriptor(
      eServiceId: string,
      descriptorId: string
    ): Promise<EServiceDescriptor> {
      const { data: eServiceDetail } = await getEServiceDescriptor(
        eServiceId,
        descriptorId,
        voucher
      );

      return eServiceDetail;
    },
  };
}

export type InteropClientService = ReturnType<
  typeof interopClientServiceBuilder
>;
