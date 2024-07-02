/* eslint-disable functional/no-method-signature */

import {
  ConsumerEservice,
  Logger,
  genericInternalError,
  isTokenExpired,
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
  getAccessToken,
} from "signalhub-interop-client";
import { toConsumerEservice } from "../models/domain/toConsumerEservice.js";
import { config } from "../config/env.js";
import { emptyQueueEventsException } from "../models/domain/errors.js";

export interface IInteropClientService {
  getEservicesEvents(lastId: number): Promise<Events>;
  getAgreementsEvents(lastId: number): Promise<Events>;
  getConsumerEservice(
    agreementId: string,
    eventId: number
  ): Promise<ConsumerEservice | null>;
  getEservice(eserviceId: string): Promise<EService | null>;
  getEserviceDescriptor(
    eServiceId: string,
    descriptorId: string
  ): Promise<EServiceDescriptor>;
  getCachedVoucher(): Promise<string>;
}

export function interopClientServiceBuilder(
  voucher: string,
  loggerInstance: Logger
): IInteropClientService {
  // eslint-disable-next-line functional/no-let
  let cachedVoucher = voucher;
  return {
    async getEservicesEvents(lastId: number): Promise<Events> {
      loggerInstance.info(
        `Retrieving Eservices events from eventId: ${lastId}, limit: ${config.eventsLimit}`
      );

      const voucher = await this.getCachedVoucher();
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

      const voucher = await this.getCachedVoucher();
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
    ): Promise<ConsumerEservice | null> {
      try {
        const voucher = await this.getCachedVoucher();
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

    async getEservice(eserviceId: string): Promise<EService | null> {
      try {
        const voucher = await this.getCachedVoucher();
        const { data: eservice } = await getEservice(voucher, eserviceId);
        return eservice;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          loggerInstance.info(
            `Agreement with agrementId ${eserviceId} not found`
          );
          return null;
        }

        throw genericInternalError("Generic internal error on getEservice ");
      }
    },

    async getEserviceDescriptor(
      eServiceId: string,
      descriptorId: string
    ): Promise<EServiceDescriptor> {
      const voucher = await this.getCachedVoucher();
      const { data: eServiceDetail } = await getEServiceDescriptor(
        voucher,
        eServiceId,
        descriptorId
      );

      return eServiceDetail;
    },

    async getCachedVoucher(): Promise<string> {
      // if is present a vocher and is not expired return the voucher, otherwise get a new one
      if (cachedVoucher || !isTokenExpired(cachedVoucher)) {
        return cachedVoucher;
      }
      cachedVoucher = await getAccessToken();
      return cachedVoucher;
    },
  };
}

export type InteropClientService = ReturnType<
  typeof interopClientServiceBuilder
>;
