/* eslint-disable functional/no-method-signature */

import {
  Logger,
  ProducerService as ProducerEService,
} from "pagopa-signalhub-commons";
import { EserviceEventDto } from "../models/domain/model.js";
import { IProducerServiceRepository } from "../repositories/producerEservice.repository.js";
import { InteropClientService } from "./interopClient.service.js";

export interface IProducerService {
  updateEservice(
    eServiceEvent: EserviceEventDto
  ): Promise<ProducerEService | null>;
  checkEserviceTable(
    eServiceId: string,
    producerId: string,
    descriptorId: string,
    eventId: number
  ): Promise<void>;
}
export function producerServiceBuilder(
  producerEserviceRepository: IProducerServiceRepository,
  interopClientService: InteropClientService,
  logger: Logger
): IProducerService {
  return {
    async updateEservice(
      eServiceEvent: EserviceEventDto
    ): Promise<ProducerEService | null> {
      logger.info(
        `Retrieving E-service from Event with eServiceId: ${eServiceEvent.eServiceId}`
      );

      // Get Eservice's detail
      const eService = await interopClientService.getEservice(
        eServiceEvent.eServiceId
      );

      if (eService) {
        logger.info(`Retrieved E-service with eServiceId: ${eService.id}`);

        /** Need to getEserviceDescriptor detail in order to retrieve state information of the eservice */
        const detailEservice = await interopClientService.getEserviceDescriptor(
          eService.id,
          eServiceEvent.descriptorId
        );

        logger.info(
          `Retrieved detail for e-service with descriptorId: ${detailEservice.id}`
        );

        /** Check if in db this eservice already exist */
        // eslint-disable-next-line functional/no-let
        let entity =
          await producerEserviceRepository.findByEserviceIdAndProducerIdAndDescriptorId(
            eService.id, // get from GetEservice
            eService.producer.id, // get from GetEservice
            eServiceEvent.descriptorId // get from event Eservice
          );

        if (!entity) {
          logger.info(
            `Eservice with eServiceId: ${eService.id} and descriptorId: ${eServiceEvent.descriptorId} doesn't exist, creating new one`
          );
          entity = await producerEserviceRepository.insertEservice(
            eService.id,
            eService.producer.id,
            eServiceEvent.descriptorId,
            eServiceEvent.eventId,
            detailEservice.state
          );

          return entity;
        }

        logger.info(`Eservice with ${entity.eserviceId} already exist on DB`);
        entity = await producerEserviceRepository.updateEservice(
          entity.eserviceId,
          entity.descriptorId,
          eServiceEvent.eventId,
          detailEservice.state
        );

        return entity;
      }

      return null;
    },

    async checkEserviceTable(
      eServiceId: string,
      producerId: string,
      descriptorId: string,
      eventId: number
    ): Promise<void> {
      logger.info(
        `starting from agreement check if Eservice is already present on DB with eServiceId: ${eServiceId} `
      );

      const entity =
        await producerEserviceRepository.findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          producerId,
          descriptorId
        );

      if (entity) {
        logger.info(
          `Eservice with eServiceId: ${entity.eserviceId} already exist on Eservice table`
        );
        return;
      }

      logger.info(
        `Eservice with eserviceId: ${eServiceId} doesn't exist, creating new one`
      );

      /** If not exist we create an object as EserviceEventDto */

      const eServiceEvent: EserviceEventDto = {
        eServiceId,
        descriptorId,
        eventId,
        eventType: "",
        objectType: "",
      };

      await this.updateEservice(eServiceEvent);
    },
  };
}

export type ProducerService = ReturnType<typeof producerServiceBuilder>;
