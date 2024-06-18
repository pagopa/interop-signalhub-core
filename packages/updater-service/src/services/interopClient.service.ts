import {
  ConsumerEserviceDto,
  Logger,
  genericInternalError,
} from "signalhub-commons";
import { AxiosError } from "axios";
import {
  getAgreement,
  getAgreementsEventsFromId,
  Events,
  getEservice,
  EService,
  EServiceDescriptor,
  getEServiceDescriptor,
  getEServicesEventsFromId,
} from "signalhub-interop-client";
import { toConsumerEservice } from "../models/domain/toConsumerEservice.js";
import { config } from "../config/env.js";
import { emptyQueueEventsException } from "../models/domain/errors.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function interopClientServiceBuilder(
  voucher: string,
  loggerInstance: Logger
) {
  return {
    async getEservicesEvents(lastId: number): Promise<Events> {
      loggerInstance.info(
        `Retrieving Eservices events from eventId: ${lastId}, limit: ${config.eventsLimit}`
      );

      const response = await getEServicesEventsFromId(voucher, {
        lastEventId: lastId,
        limit: config.eventsLimit,
      });

      const { events, lastEventId } = response.data;

      if (!events || events.length <= 0) {
        loggerInstance.info("Events list is empty");
        throw emptyQueueEventsException();
      }

      loggerInstance.info(`Total events retrieved: ${events.length}`);

      return { events, lastEventId };
    },
    async getAgreementsEvents(lastId: number): Promise<Events> {
      loggerInstance.info(
        `Retrieving Agremeent events from eventId: ${lastId}`
      );

      const response = await getAgreementsEventsFromId(voucher, {
        lastEventId: lastId,
        limit: config.eventsLimit,
      });

      const { events, lastEventId } = response.data;

      if (!events || events.length <= 0) {
        loggerInstance.info("Events list is empty");
        throw emptyQueueEventsException();
      }

      loggerInstance.info(`Total events retrieved: ${events.length}`);

      return { events, lastEventId };
    },

    async getConsumerEservice(
      agreementId: string,
      eventId: number
    ): Promise<ConsumerEserviceDto | null> {
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
