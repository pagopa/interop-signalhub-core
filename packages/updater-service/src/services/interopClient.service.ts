import { Logger, genericInternalError } from "signalhub-commons";
import { AxiosError } from "axios";
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
import { config } from "../config/env.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopClientServiceBuilder(
  voucher: string,
  loggerInstance: Logger
) {
  return {
    async getAgreementsEvents(
      lastId: number
    ): Promise<{ events: Event[]; lastEventId?: number }> {
      try {
        loggerInstance.info(
          `Retrieving Agremeent events from eventId: ${lastId}`
        );

        const response = await getAgreementsEventsFromId(
          voucher,
          lastId,
          config.eventsLimit as number
        );

        const { events, lastEventId } = response.data;

        if (!events) {
          loggerInstance.info("Events list is empty");
          throw genericInternalError("events list is empty transformToError");
        }

        loggerInstance.info(`Total events retrieved: ${events.length}`);

        return { events, lastEventId };
      } catch (error) {
        throw genericInternalError("transform to interopCommunicationError");
      }
    },

    async getConsumerEservice(
      agreementId: string,
      eventId: number
    ): Promise<ConsumerEserviceEntity | null> {
      try {
        const { data: agreement } = await getAgreement(voucher, agreementId);
        return toConsumerEservice(agreement, eventId);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          loggerInstance.info(
            `Agreement with agrementId ${agreementId} not found`
          );
          return null;
        }

        throw genericInternalError("Generic internal error on getAgreement");
      }
    },

    async getEservice(eserviceId: string): Promise<EService> {
      const { data: eservice } = await getEservice(voucher, eserviceId);
      return eservice;
    },

    async getEserviceDescriptor(
      eServiceId: string,
      descriptorId: string
    ): Promise<EServiceDescriptor> {
      const { data: eServiceDetail } = await getEServiceDescriptor(
        voucher,
        eServiceId,
        descriptorId
      );

      return eServiceDetail;
    },
  };
}

export type InteropClientService = ReturnType<
  typeof interopClientServiceBuilder
>;
